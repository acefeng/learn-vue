export function isObject(target) {
    return typeof target === 'object' && target !== null;
}

export function isReactive(target) {
    return !!(target && target.__isReactive);
}

export function hasChanged(oldValue, value) {
    return oldValue !== value && !(Number.isNaN(oldValue) && Number.isNaN(value));
}

export function isFunction(target) {
    return typeof target === 'function';
}