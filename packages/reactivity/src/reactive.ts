import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'
export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
}

// 通过判断对象是否有 IS_REACTIVE 属性，有则为 reactive
export function isReactive(value: unknown): boolean {
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

const reactiveMap = new WeakMap() // key 只能是对象

export function reactive(target: object) {
    if (!isObject(target)) {
        // 不对非对象类型进行处理
        return target
    }
    // 如果取值的时候走了代理对象的 get 方法，便是被代理过的，并没有增加这个属性
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }
    // 对象被代理过直接 return
    const existProxy = reactiveMap.get(target)
    if (existProxy) {
        return existProxy
    }
    // 对对象进行代理
    const proxy = new Proxy(target, mutableHandlers)
    // 缓存一下，代理过的对象，下次再进行代理的时候，直接拿出来用即可
    reactiveMap.set(target, proxy)
    return proxy
}
