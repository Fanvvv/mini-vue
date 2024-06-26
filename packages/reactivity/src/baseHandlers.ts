import { ReactiveFlags, reactive } from './reactive'
import { track, trigger } from './effect'
import { isObject } from '@vue/shared'

export const mutableHandlers = {
    get(target, p: string | symbol, receiver: object) {
        // 被代理过的对象才会走 get方法
        if (ReactiveFlags.IS_REACTIVE === p) {
            return true
        }
        // 触发 get 的时候进行依赖收集
        track(target, p)
        const r = Reflect.get(target, p, receiver)
        // 深度代理
        if (isObject(r)) {
            return reactive(r) // 只有用户取值的时候，才会进行二次代理，不用担心性能
        }
        return r
    },
    set(
        target: object,
        p: string | symbol,
        newValue: unknown,
        receiver: object,
    ) {
        // 用户赋值操作
        let oldValue = target[p] // 没有修改之前的值
        // 返回一个 boolean 类型
        const r = Reflect.set(target, p, newValue, receiver)
        // 新值和老值不相同，触发更新
        if (oldValue !== newValue) {
            trigger(target, p, newValue, oldValue)
        }
        return r
    },
}
