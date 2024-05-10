import { hasChanged, isFunction, isObject } from '@vue/shared'
import { isReactive, reactive } from './reactive'
import { activeEffect, trackEffects, triggerEffects } from './effect'
import type { ComputedRef } from './computed'

export interface Ref<T = any> {
    value: T
}

export type MaybeRef<T = any> = T | Ref<T>
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | (() => T)

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

class ObjectRefImpl<T extends object, K extends keyof T> {
    public __v_isRef = true

    constructor(
        private readonly object: T,
        private readonly key: K,
    ) {}

    get value() {
        return this.object[this.key]
    }

    set value(newVal) {
        this.object[this.key] = newVal
    }
}

function propertyToRef(source: Record<string, any>, key: string) {
    const val = source[key]
    return isRef(val) ? val : (new ObjectRefImpl(source, key) as any)
}

class GetterRefImpl<T> {
    public readonly __v_isRef = true
    public readonly __v_isReadonly = true

    constructor(private readonly _getter: () => T) {}

    get value() {
        return this._getter()
    }
}

export function toRef(source, key?: string): Ref {
    if (isRef(source)) {
        // 如果是 ref 则直接返回
        return source
    } else if (isFunction(source)) {
        // return source()
        // 直接调用source()是对函数的一次性调用，得到一个立即值。
        // 而new GetterRefImpl(source)创建了一个可以被Vue追踪并在其响应式系统中作为只读引用使用的对象，它延迟了source函数的执行，直到实际需要这个值的时候
        // .value 的时候再取值
        return new GetterRefImpl(source) as any
    } else if (isObject(source) && arguments.length > 1) {
        // 假如传入的是对象，必须传入 key，也需要转成 ref
        return propertyToRef(source, key!)
    } else {
        // 返回个 ref
        return ref(source)
    }
}

export function toValue<T>(source: MaybeRefOrGetter<T> | ComputedRef<T>): T {
    return isFunction(source) ? source() : unref(source)
}

export function toRefs<T extends object>(object: T) {
    const ret: any = Array.isArray(object) ? new Array(object.length) : {}
    for (const key in object) {
        ret[key] = propertyToRef(object, key)
    }
    return ret
}

const shallowUnwrapHandles: ProxyHandler<any> = {
    get: (target, p, receiver) => {
        return unref(Reflect.get(target, p, receiver))
    },
    set(target, p, newValue, receiver) {
        const oldValue = target[p]
        if (isRef(oldValue) && !isRef(newValue)) {
            oldValue.value = newValue
            return true
        } else {
            return Reflect.set(target, p, newValue, receiver)
        }
    },
}

export function proxyRefs<T extends object>(object: T) {
    return isReactive(object) ? object : new Proxy(object, shallowUnwrapHandles)
}
