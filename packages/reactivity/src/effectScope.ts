import type { ReactiveEffect } from './effect'

export let activeEffectScope: EffectScope | undefined

class EffectScope {
    _active = true
    parent = undefined
    effects = [] // 这个是收集内部的 effect
    scopes // 这个是收集作用域的

    constructor(public detached = false) {
        if (!detached && activeEffectScope) {
            // 内部的 effectScope, 如果传的 detached 为 true，则不被收集
            activeEffectScope.scopes ||
                (activeEffectScope.scopes = []).push(this)
        }
    }

    get active() {
        return this._active
    }

    run<T>(fn: () => T): T | undefined {
        if (this._active) {
            try {
                this.parent = activeEffectScope
                activeEffectScope = this
                return fn()
            } finally {
                activeEffectScope = this.parent
            }
        }
    }

    stop() {
        if (this._active) {
            for (let i = 0; i < this.effects.length; i++) {
                this.effects[i].stop() // 让每一个存储的effect都停止
            }

            if (this.scopes) {
                for (let i = 0; i < this.scopes.length; i++) {
                    this.scopes[i].stop() // 调用的是作用域的stop
                }
            }
            this.parent = undefined
            // 变成失活态
            this._active = false
        }
    }
}

export function recordEffectScope(effect: ReactiveEffect) {
    // 收集内部的 effect
    if (activeEffectScope && activeEffectScope.active) {
        activeEffectScope.effects.push(effect)
    }
}

export function effectScope(detached?: boolean) {
    return new EffectScope(detached)
}
