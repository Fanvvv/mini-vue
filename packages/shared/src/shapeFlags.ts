export enum ShapeFlags {
    ELEMENT = 1, // 虚拟节点是一个元素
    FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
    STATEFUL_COMPONENT = 1 << 2, // 普通组件
    TEXT_CHILDREN = 1 << 3, // 子元素是文本
    ARRAY_CHILDREN = 1 << 4, // 子元素是数组
    SLOTS_CHILDREN = 1 << 5, // 子元素是插槽
    TELEPORT = 1 << 6, //
    SUSPENSE = 1 << 7,
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 是否应该 keep-alive
    COMPONENT_KEPT_ALIVE = 1 << 9, // 有没有 keep-alive
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 函数组件或者普通组件
}

/**
 * | 或运算符 有1才是1
 * 000001 | 000010 = 000011
 * 1 | 2 = 3
 *
 * & 与运算符 都是1才是1
 * 000001 & 000011 = 000001
 * 1 & 3 = 1
 *
 * 用大的和小的做与运算 > 0 就说明包含
 * ShapeFlags.COMPONENT & ShapeFlags.FUNCTIONAL_COMPONENT
 * 3 & 2 = 2  大于 0 表示 COMPONENT 包含 FUNCTIONAL_COMPONENT
 */
