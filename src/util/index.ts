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

export function isString(target) {
    return typeof target === 'string';
}

export function isNumber(target) {
    return typeof target === 'number';
}

export function isBoolean(target) {
    return typeof target === 'boolean';
}