export function patchStyle(el, prev, next) {
    const style = el.style

    for (const key in next) {
        // 设置值
        style[key] = next[key]
    }

    for (const key in prev) {
        // 如果新值中没有老值中的key，则移除
        if (next[key] === null) {
            style[key] = null // el[style][key] = 'xxx'
        }
    }
}
