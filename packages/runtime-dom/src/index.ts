import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
import { createRenderer } from './renderer'

const renderOptions = Object.assign(nodeOps, { patchProp })

/**
 * 用户可以使用 createRender 自定义 render 方法
 * 也可以使用提供默认配置的 render 方法
 */
export const render = (vnode, container) => {
    return createRenderer(renderOptions).render(vnode, container)
}

export * from '@vue/runtime-core'
