// 用一个全局变量存储被注册的副作用函数
export let activeEffect

class ReactiveEffect<T = any> {
    active = true
    // effect 嵌套的父子关系
    parent = undefined
    // 记录 activeEffect 依赖了哪些属性
    deps = []
    constructor(public fn: () => T) {}

    run() {
        if (!this.active) {
            // 如果是失活的，表示不在effect函数中，直接函数执行即可
            return this.fn()
        }
        // 其他情况为激活状态，表示在 effect 函数中
        try {
            // 父子关系用于 effect 嵌套收集
            this.parent = activeEffect
            activeEffect = this
            return this.fn()
        } finally {
            activeEffect = this.parent
            this.parent = undefined
        }
    }
}

// 依赖收集 就是将当前的 effect 变成全局的 稍后取值的时候可以拿到这个全局的 effect
// 用于注册副作用函数
export function effect<T = any>(fn: () => T) {
    const _effect = new ReactiveEffect(fn)
    _effect.run() // 默认让响应式的 effect 执行一次
}

/**
 * const state = reactive({ name: 'fan' })
 * effect(function activeEffect1() => {
 *   document.body.innerText = state.name
 * })
 * effect(function activeEffect2() => {
 *   document.body.innerText = state.name
 * })
 * 代理对象中属性与 effect 映射关系：（属性可以在多个 effect 中使用）
 * const mapping = { // weakMap()
 *   target: { // Map()
 *     name: [activeEffect1, activeEffect2] // Set()
 *   }
 * }
 * 一个属性对应多个 effect，一个 effect 对应多个属性
 * 属性和 effect 的关系是多对多的关系
 */
const targetMap = new WeakMap()
export function track(target, key) {
    if (!activeEffect) {
        // 取值操作没有发生在 effect 中
        return
    }
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    // 判断需不需要收集，没有 activeEffect 的时候进行收集
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect)
        activeEffect.deps.push(dep)
    }
}

export function trigger(target, key, newValue, oldValue) {
    // weakMap { obj: map(key, set(effect))}
    const depsMap = targetMap.get(target)
    // 判断 map 是否有值，没有直接返回
    if (!depsMap) {
        return
    }
    // 如果 set 有值才进行操作
    const dep = depsMap.get(key)
    if (dep) {
        // 遍历存放 effect 的set，执行fn函数
        dep.forEach(effect => {
            effect.run()
            // 当重新执行此effect函数，会将当前的effect放在全局上
            // 判断是否与全局的一样，如果一样，表示执行过
            // if (activeEffect != effect) {
            //     effect.run()
            // }
        })
    }
}
