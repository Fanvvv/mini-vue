import { ShapeFlags } from '@vue/shared'
import { isSameVNodeType } from '@vue/runtime-core'
import {patchProp} from "./patchProp";

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

    /**
     * 挂载子元素
     * @param children
     * @param el
     * @param start
     */
    const mountChildren = (children, el, start = 0) => {
        for (let i = start; i < children.length; i++) {
            patch(null, children[i], el)
        }
    }

    /**
     * 卸载子元素
     * @param children
     * @param start
     */
    const unmountChildren = (children, start = 0) => {
        for (let i = start; i < children.length; i++) {
            unmount(children[i])
        }
    }

    /**
     * 挂在元素节点
     * @param vnode
     * @param container
     */
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

    /**
     * 对比属性，更新属性
     * @param oldProps
     * @param newProps
     * @param el
     */
    const patchProps = (oldProps, newProps, el) => {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prev = oldProps[key]
                const next = newProps[key]
                if (prev !== next) {
                    // 新的有，老的没有，用新的改掉老的
                    hostPatchProp(el, key, prev, next)
                }
            }
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    // 老的存在，新的没有，置为 null
                    const prev = oldProps[key]
                    hostPatchProp(el, key, prev, null)
                }
            }
        }
    }

    /**
     * 对比子元素，更新子元素
     * 比较情况有如下：
     *   新儿子	 旧儿子	    操作方式
     * 1 文本	 数组	   （删除老儿子，设置文本内容）
     * 2 文本	 文本	   （更新文本即可）
     * 3 文本	 空	       （更新文本即可) 与上面的类似
     * 4 数组	 数组	   （diff 算法）
     * 5 数组	 文本	   （清空文本，进行挂载）
     * 6 数组	 空	       （进行挂载） 与上面的类似
     * 7 空	     数组	   （删除所有儿子）
     * 8 空	     文本	   （清空文本）
     *   空	     空	       （无需处理）
     * @param n1
     * @param n2
     */
    const patchChildren = (n1, n2, el) => {
        const c1 = n1 && n1.children
        const c2 = n2.children
        const prevShapeFlag = n1 ? n1.shapeFlag : 0
        const { shapeFlag } = n2

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1
                // 新儿子为文本，旧儿子为数组
                // 删除老儿子
                unmountChildren(c1)
            }
            if (c1 !== c2) {
                // 2 3
                // 新儿子为文本，旧儿子为空或者为不相同的文本时，更新文本
                hostSetElementText(el, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 4
                    // 旧儿子为数组，新儿子也为数组，使用全量diff

                } else {
                    // 7
                    // 旧儿子为数组，新儿子为空，删除所有儿子
                    unmountChildren(c1)
                }
            } else {
                // 新儿子为数组或空
                // 老儿子为文本或空
                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    // 8
                    // 旧儿子为文本，清空文本
                    hostSetElementText(el, '')
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 5 6
                    // 新儿子为数组，旧儿子为文本或空，进行挂载
                    mountChildren(c2, el)
                }
            }
        }
    }

    /**
     * 对比 n1 和 n2 的属性差异
     * @param n1
     * @param n2
     */
    const patchElement = (n1, n2) => {
        let el = (n2.el = n1.el)
        const oldProps = n1.props || {}
        const newProps = n2.props || {}
        // 更新老元素
        patchProps(oldProps, newProps, el)
        patchChildren(n1, n2, el)
    }

    const processElement = (n1, n2, container) => {
        if (n1 == null) {
            // 初渲染
            mountElement(n2, container)
        } else {
            // diff 算法
            patchElement(n1, n2)
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

    /**
     * 卸载，移除节点
     * @param vnode
     */
    const unmount = vnode => {
        // 清空
        return hostRemove(vnode.el)
    }

    /**
     * 渲染函数，将虚拟节点渲染为真实节点
     * @param vnode
     * @param container
     */
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
