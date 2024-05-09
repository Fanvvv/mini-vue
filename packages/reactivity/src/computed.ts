import { ReactiveEffect, trackEffects, triggerEffects } from './effect'
import { NOOP, isFunction } from '@vue/shared'
import type { Ref } from './ref'

export type ComputedGetter<T> = (oldValue?: T) => T
export type ComputedSetter<T> = (newValue: T) => void

export interface WritableComputedOptions<T> {
    get: ComputedGetter<T>
    set: ComputedSetter<T>
}

export interface WritableComputedRef<T> extends Ref<T> {
    readonly effect: ReactiveEffect<T>
}

export interface ComputedRef<T = any> extends WritableComputedRef<T> {
    readonly value: T
}

export class ComputedRefImpl<T> {
    public dep = undefined
    public readonly effect: ReactiveEffect<T>
    public readonly __v_isRef = true // 意味着有这个属性，需要用 .value 来进行取值
    public _dirty = true // 数据是否是脏的，脏的说明值变了
    private _value!: T // 默认的缓存结果

    constructor(
        private getter: ComputedGetter<T>,
        private readonly _setter: ComputedSetter<T>,
    ) {
        // 源码这里不能使用 effect(() => {}, { scheduler() {} })
        this.effect = new ReactiveEffect<T>(this.getter, () => {
            this._dirty = true
            // 触发更新
            triggerEffects(this.dep)
        })
    }
    // 类的属性访问器 Object.defineProperty(实例, value, { get })
    get value() {
        // 如果有 activeEffect 意味着这个计算属性在 effect 中使用
        // 需要让计算属性收集这个 effect
        // 用户取值的时候发生依赖收集
        trackEffects(this.dep || (this.dep = new Set()))
        // 取值才执行，并把取的值缓存起来
        if (this._dirty) {
            this._value = this.effect.run()
            this._dirty = false // 意味着取过值了
        }
        return this._value
    }

    set value(newValue: T) {
        this._setter(newValue)
    }
}

export function computed<T>(
    getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
) {
    let getter: ComputedGetter<T>
    let setter: ComputedSetter<T>
    // 判断是否为函数，是的话代表只传了一个 getter
    const onlyGetter = isFunction(getterOrOptions)
    if (onlyGetter) {
        // 将传入的值赋给 getter，setter为空操作
        getter = getterOrOptions
        setter = NOOP
    } else {
        // 传入对象代表有getter和setter，进行赋值
        getter = getterOrOptions.get
        setter = getterOrOptions.set || NOOP
    }
    // 返回 ComputedRef 实现类，对数据进行依赖收集和触发更新
    return new ComputedRefImpl(getter, setter)
}
