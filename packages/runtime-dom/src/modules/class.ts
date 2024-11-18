export function patchClass(el: Element, value: string | null, isSvg: boolean): void {
    if (value == null) {
        el.removeAttribute('class')
    } else if (isSvg) {
        el.setAttribute('class', value)
    } else {
        el.className = value
    }
}