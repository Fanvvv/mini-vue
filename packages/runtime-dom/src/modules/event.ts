/**
 * 比如：@click="fn1" 要更新为 @click="fn2"
 * 如果不想使用频繁 addEventListener 和 removeEventListener，可以利用技巧
 * invoker.value = fn1
 * 要更新事件直接更改value的引用地址就可以了 invoker.value = fn2
 */

function createInvoker(initialValue) {
    const invoker = (e) => invoker.value(e)
    invoker.value = initialValue
    return invoker
}

// 函数更新成新的函数了直接更改.value即可
export function patchEvent(el, key, nextValue) {
    // vue event invoker
    const invokers = el._vei || (el._vei = {})
    // 如果nextValue为空，而且有绑定过事件，要移除
    // onClick -> click
    const name = key.slice(2).toLowerCase()
    // 缓存中是否有值
    const existingInvoker = invokers[name]
    if (nextValue && existingInvoker) {
        // 更新事件
        existingInvoker.value = nextValue
    } else {
        if (nextValue) {
            // 缓存创建的invoker
            const invoker = (invokers[name] = createInvoker(nextValue))
            el.addEventListener(name, invoker)
        } else if (existingInvoker) {
            el.removeEventListener(name, existingInvoker)
            invokers[name] = null
        }
    }
}