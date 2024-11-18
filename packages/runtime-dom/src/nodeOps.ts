
export const svgNS = 'http://www.w3.org/2000/svg'
export const mathmlNS = 'http://www.w3.org/1998/Math/MathML'

export const nodeOps = {
    insert: (child, parent, anchor) => {
        // insertBefore：将一个节点插入到指定父节点的子节点中，并位于参考节点之前
        // 第一个参数：要插入的节点 newNode
        // 第二个参数：在其之前插入 newNode 的节点。如果为 null，newNode 将被插入到节点的子节点列表末尾
        parent.insertBefore(child, anchor || null)
    },

    remove: child => {
        const parent = child.parentNode
        if (parent) {
            // 移除子元素
            parent.removeChild(child)
        }
    },

    createElement: (tag, namespace, is, props) => {
        // createElementNS：创建一个具有指定的命名空间 URI 和限定名称的元素
        // is 为了兼容老版本的自定义元素
        const el = namespace === 'svg' ? document?.createElementNS(svgNS, tag) :
            namespace === 'mathml' ? document.createElementNS(mathmlNS, tag) :
                is ? document.createElement(tag, { is }) : document.createElement(tag)
        if (tag === 'select' && props && props.multiple !== null) {
            el.setAttribute('multiple', props.multiple)
        }
        return el
    },

    createText: text => document.createTextNode(text),

    createComment: text => document.createComment(text),

    setText: (node, text) => {
        node.nodeValue = text
    },

    setElementText: (el, text) => {
        el.textContent = text
    },

    parentNode: node => node.parentNode as Element | null,

    nextSibling: node => node.nextSibling,

    querySelector: selector => document.querySelector(selector),
}
