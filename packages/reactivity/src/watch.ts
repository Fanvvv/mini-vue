import { isReactive } from './reactive'
import { isFunction, isObject, isPlainObject } from '@vue/shared'
import { ReactiveEffect } from './effect'

export interface WatchOptionsBase {
    flush?: 'pre' | 'post' | 'sync'
}
export interface WatchOptions<Immediate = boolean> extends WatchOptionsBase {
    immediate?: Immediate
    deep?: boolean
    once?: boolean
}

type OnCleanup = (cleanupFn: () => void) => void

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

export function doWatch(source, cb, { immediate }: WatchOptions = {}) {
    let getter: () => any
    if (isReactive(source)) {
        // 最终都处理成函数
        getter = () => traverse(source) // 直接稍后调用run的时候会执行此函数，直接返回对象，只有访问属性才能依赖收集
    } else if (isFunction(source)) {
        if (cb) {
            getter = source
        } else {
            getter = () => {
                if (cleanup) {
                    cleanup()
                }
                // watchEffect 也可以接收一个 onCleanup 参数
                return source(onCleanup)
            }
        }
    }

    let oldValue: any
    let cleanup: (() => void) | undefined
    const onCleanup: OnCleanup = (fn: () => void) => {
        cleanup = fn
    }
    const job = () => {
        // 内部调用 cb 也就是 watch 的回调方法
        if (!effect.active) {
            return
        }
        if (cb) {
            // watch(source, cb)
            const newValue = effect.run() // 再次调用 effect，拿到新值
            if (cleanup) cleanup()
            cb(newValue, oldValue, onCleanup) // 调用回调传入新值和老值
            oldValue = newValue // 更新
        } else {
            // watchEffect
            effect.run() // 调用 run 方法，会触发依赖重新清理和收集
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

export function watch(source: any, cb: any, options?: WatchOptions) {
    return doWatch(source, cb, options)
}

export function watchEffect(source: any, options?: WatchOptionsBase) {
    return doWatch(source, null, options)
}
