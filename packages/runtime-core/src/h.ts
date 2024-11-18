
/*
// type only
h('div')

// type + props
h('div', {})

// type + omit props + children
// Omit props does NOT support named slots
h('div', []) // array
h('div', 'foo') // text
h('div', h('br')) // vnode
h(Component, () => {}) // default slot

// type + props + children
h('div', {}, []) // array
h('div', {}, 'foo') // text
h('div', {}, h('br')) // vnode
h(Component, {}, () => {}) // default slot
h(Component, {}, {}) // named slots

// named slots without props requires explicit `null` to avoid ambiguity
h(Component, null, {})
**/

import { isObject } from '@vue/shared'
import { createVNode, isVNode } from './vnode'

export function h(type: any, propsOrChildren?: any, children?: any) {
    const length = arguments.length
    if (length === 2) {
        // type + props / type + children
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
            if (isVNode(propsOrChildren)) {
                // h('div', h('br')) // vnode
                return createVNode(type, null, propsOrChildren)
            }
            // 只有 props, 没有 children
            // h('div', { style: { color:'red' }})
            return createVNode(type, propsOrChildren)
        } else {
            // 传递儿子列表的情况
            // h('div', []) // array
            // h('div', 'foo') // text
            return createVNode(type, null, propsOrChildren)
        }
    } else {
        if (length > 3) {
            // 超过3个除了前两个都是儿子
            // h('div', {}, 'a', 'b', 'c')
            children = Array.from(arguments).slice(2)
        } else if (length === 3 && isVNode(children)) {
            // 儿子是 vnode 将其包装成 h('div', null, [h('span')])
            children = [children]
        }
        return createVNode(type, propsOrChildren, children)
    }
}