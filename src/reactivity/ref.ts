import { hasChanged, isObject } from "../util";
import { trigger, track } from "./effect";
import { reactive } from "./reactive";

export function ref(value) {
    if (isRef(value)) {
      return value;
    }
    return new RefImpl(value);
}
  

export function isRef(value) {
    return !!(value && value.__isRef);
}

class RefImpl {
    private __isRef: boolean
    private _value: any
    constructor(value) {
        // 主要用来判断当前的值是否是ref  标识位
        this.__isRef = true;
        this._value = convert(value);
    }
    // ref不用proxy直接用get和set就成了
    get value() {
        track(this, 'value');
        return this._value;
    }

    set value(newValue) {
        if(hasChanged(newValue, this._value)) {
            this._value = newValue;
            trigger(this, 'value')
        }
    }
}

function convert(value) {
    // 如果是基础变量直接用就行，但是如果是对象就得用reactive包一层
    // ps: 这种脑残用法应该不会有人用吧......
    return isObject(value) ? reactive(value) : value;
}