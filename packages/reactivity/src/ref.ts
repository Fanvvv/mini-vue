import { hasChanged, isObject } from '@vue/shared'
import { reactive } from './reactive'
import { activeEffect, trackEffects, triggerEffects } from './effect'
import type { ComputedRef } from './computed'

export interface Ref<T = any> {
    value: T
}

export type MaybeRef<T = any> = T | Ref<T>

export function isRef(r: any): r is Ref {
    return !!(r && r.__v_isRef === true)
}

export function createRef(rawValue: unknown) {
    // 判断传入的值是否为Ref，如果是则直接返回
    if (isRef(rawValue)) {
        return rawValue
    }
    return new RefImpl(rawValue)
}

export function ref(value?: unknown) {
    return createRef(value)
}

// 如果是对象就转成 reactive，否则返回原来的值
export const toReactive = <T extends unknown>(value: T): T =>
    isObject(value) ? reactive(value) : value

class RefImpl<T> {
    private _value: T
    public readonly __v_isRef = true
    public dep? = undefined

    constructor(public rawValue: T) {
        this._value = toReactive(this.rawValue)
    }

    get value() {
        // 依赖收集
        if (activeEffect) {
            trackEffects(this.dep || (this.dep = new Set()))
        }
        return this._value
    }

    set value(newValue) {
        // 比较两个值是否一样，如果不一样则重新赋值
        if (hasChanged(newValue, this.rawValue)) {
            this.rawValue = newValue
            this._value = toReactive(newValue)

            // 触发更新
            triggerEffects(this.dep)
        }
    }
}

/**
 * 可用于保证 ts 类型
 * function useFoo(x: number | Ref<number>) {
 *   const unwrapped = unref(x)
 *   // unwrapped 保证是一个 number 类型
 * }
 * @param ref
 */
export function unref<T>(ref: MaybeRef<T> | ComputedRef<T>): T {
    return isRef(ref) ? ref.value : ref
}
