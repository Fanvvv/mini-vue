// 空操作
export const NOOP = () => {}
// 判断类型是否为对象
export const isObject = (val: unknown): val is Record<any, any> =>
    val !== null && typeof val === 'object'
// 判断类型是否为函数
export const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'
