import { ShapeFlags } from '@vue/shared'
import { isSameVNodeType } from '@vue/runtime-core'

export function createRenderer(options) {
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
    } = options

    const mountChildren = (children, el, start = 0) => {
        for (let i = start; i < children.length; i++) {
            patch(null, children[i], el)
        }
    }

    const mountElement = (vnode, container) => {
        const { type, props, children, shapeFlag } = vnode
        // 创建元素
        const el = (vnode.el = hostCreateElement(type))
        // 添加属性
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }
        // 处理子节点
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el)
        } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children)
        }
        hostInsert(el, container)
    }

    const processElement = (n1, n2, container) => {
        if (n1 == null) {
            // 初渲染
            mountElement(n2, container)
        } else {
            // diff 算法
        }
    }

    /**
     * 更新
     * @param n1 旧节点
     * @param n2 新节点
     * @param container 容器
     */
    const patch = (n1, n2, container) => {
        // patch 函数不仅可以用来完成更新，也可以用来执行挂载。
        if (n1 === n2) {
            return
        }
        // n1 div -> n2 p
        // 如果 n1 n2 都有值，但是类型不同则删除 n1 换 n2
        if (n1 && !isSameVNodeType(n1, n2)) {
            unmount(n1) // 删除节点
            n1 = null
            // 删除节点后会执行 processElement 进行渲染 n2
        }
        // 处理元素
        processElement(n1, n2, container)
    }

    const unmount = vnode => {
        // 清空
        hostRemove(vnode.el)
    }

    const render = (vnode, container) => {
        if (vnode == null) {
            if (container._vnode) {
                // 卸载： 旧 vnode 存在，且新 vnode 不存在
                // 只需要将 container 内 DOM 清空
                unmount(container._vnode)
            }
        } else {
            // 新 vnode 存在，将与旧 vnode 一起传递给 patch，进行更新
            patch(container._vnode, vnode, container)
        }
        // 把 vnode 存储到 container._vnode 下，后续渲染中的旧 vnode
        container._vnode = vnode
    }

    return {
        // createRenderer 可以用户自定义渲染方式
        // createRenderer 返回的 render 方法接收参数是虚拟节点和容器
        // render + dom api = 真实dom
        render,
    }
}
