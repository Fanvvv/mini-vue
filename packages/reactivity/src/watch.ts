import { isReactive } from './reactive'
import { isFunction, isObject, isPlainObject } from '@vue/shared'
import { ReactiveEffect } from './effect'

export interface WatchOptions<Immediate = boolean> {
    immediate?: Immediate
    deep?: boolean
    once?: boolean
}

export function traverse(value: unknown, seen?: Set<unknown>) {
    if (isObject(value)) {
        return value
    }
    // 考虑循环引用的问题，采用set来解决这个问题
    seen = seen || new Set()
    if (seen.has(value)) {
        return value
    }

    seen.add(value)
    // 如果值还是对象，接着取
    if (isPlainObject(value)) {
        for (const key in value) {
            traverse(value[key], seen) // 递归取值
        }
    }
    return value
}

export function watch(source, cb, { immediate }: WatchOptions = {}) {
    let getter: () => any
    if (isReactive(source)) {
        // 最终都处理成函数
        getter = () => traverse(source) // 直接稍后调用run的时候会执行此函数，直接返回对象，只有访问属性才能依赖收集
    } else if (isFunction(source)) {
        getter = source
    }

    let oldValue: any
    const job = () => {
        // 内部调用 cb 也就是 watch 的回调方法
        if (!effect.active) {
            return
        }
        if (cb) {
            // watch(source, cb)
            const newValue = effect.run() // 再次调用 effect，拿到新值
            cb(newValue, oldValue) // 调用回调传入新值和老值
            oldValue = newValue // 更新
        } else {
            // watchEffect
            effect.run()
        }
    }

    const effect = new ReactiveEffect(getter, job)

    // 初始化
    if (cb) {
        if (immediate) {
            job()
        } else {
            oldValue = effect.run() // 保留老值
        }
    } else {
        // watchEffect
        effect.run()
    }
}
