import { patchClass } from './modules/class'
import { patchStyle } from './modules/style'
import { patchEvent } from './modules/event'
import { patchAttr } from './modules/attr'
import { isOn } from '@vue/shared'

export const patchProp = (el, key, prevValue, nextValue, namespace) => {
    // 这里只考虑 class、style、event、attr
    const isSVG = namespace === 'svg'
    if (key === 'class') {
        // 更新 class
        patchClass(el, nextValue, isSVG)
    } else if (key === 'style') {
        // 更新 style
        patchStyle(el, prevValue, nextValue)
    } else if (isOn(key)) {
        // event
        patchEvent(el, key, nextValue)
    } else {
        // attr
        patchAttr(el, key, nextValue)
    }
}
