import { isString } from '@vue/shared'
import { ShapeFlags } from '@vue/shared/src/shapeFlags'

// 判断是否为虚拟节点
export function isVNode(value: any) {
    return value ? value.__v_isVNode === true : false
}

export function createVNode(type, props = null, children = null) {
    // 元素的类型有：文本、元素、组件、keep-alive......
    // 用标识来区分对应的虚拟节点类型
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
    // 虚拟节点要对应真实节点
    const vnode = {
        __v_isVNode: true, // 标识是否为虚拟节点
        type,
        props,
        children,
        shapeFlag,
        key: props?.key,
        el: null, // 对应真实节点
    }

    if (children) {
        let type = 0
        if (Array.isArray(children)) {
            // [vnode, '文本']
            type = ShapeFlags.ARRAY_CHILDREN
        } else {
            // 文本
            type = ShapeFlags.TEXT_CHILDREN
        }
        vnode.shapeFlag |= type
    }

    return vnode
}