// 空操作
export const NOOP = () => {}

// 判断类型是否为对象
export const isObject = (val: unknown): val is Record<any, any> =>
    val !== null && typeof val === 'object'

// 判断类型是否为函数
export const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'

// toString 方法
export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
    objectToString.call(value)

// 判断是否为原始对象
export const isPlainObject = (val: unknown): val is object =>
    toTypeString(val) === '[object Object]'

// 比较值是否有更改，并考虑NaN
export const hasChanged = (value: any, oldValue: any): boolean =>
    !Object.is(value, oldValue)

// 判断是否为事件监听器 以onXxx的形式书写
export const isOn = (key: string) =>
    key.charCodeAt(0) === 111 &&
    key.charCodeAt(1) === 110 &&
    (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97)
