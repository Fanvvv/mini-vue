export const createRenderer = () => {
    /**
     * 更新
     * @param n1 旧节点
     * @param n2 新节点
     * @param container 容器
     */
    const patch = (n1, n2, container) => {
        // patch 函数不仅可以用来完成更新，也可以用来执行挂载。
    }

    const unmount = n1 => {
        // 清空
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
        render,
    }
}
