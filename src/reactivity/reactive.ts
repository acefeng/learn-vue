import { isObject, isReactive, hasChanged } from "../util";
import { trigger, track } from "./effect";
const proxyMap = new WeakMap();
export function reactive(target) {
    if(!isObject(target)) {
        return  target;
    }
    if(isReactive(target)) {
        return  target;
    }
    if(proxyMap.has(target)) {
        return target;
    }
    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            // 这里增加个 __isReactive 表示位用来判断是否为reactive
            if (key === '__isReactive') return true;
            const res = Reflect.get(target, key, receiver);
            // 依赖收集，存下来此时要更新的变量
            track(target, key);
            if(isObject(res)) {
                Reflect.set(target, key, reactive(res), receiver);
                return Reflect.get(target, key, receiver);
            } else {
                return res;
            }
        },
        set(target, key, value, receiver) {
            const oldLength = target.length;
            const oldValue = Reflect.get(target, key, receiver);
            const res = Reflect.set(target, key, value, receiver);
            // 只有真正触发了变量更新才进行修改
            if(hasChanged(oldValue, value)) {
                trigger(target, key);
                if(Array.isArray(target) && hasChanged(oldLength, target.length)) {
                    trigger(target, 'length');
                }
            } 
            return res;
        }
    });
    
    proxyMap.set(target, proxy);
    return proxy;
}