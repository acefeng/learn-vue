import { isBoolean } from '../util';
const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
// 对比props
export function patchProps(oldProps: any, newProps: any, el: any) {
    // props地址相同就不用变化了
    if (oldProps === newProps) {
        return;
    }
    newProps = newProps || {};
    oldProps = oldProps || {};
    // 遍历新props，看看是否在旧的props中存在 做不同处理
    for (const key in newProps) {
        if (key === 'key') {
            continue;
        }
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev) {
            patchDomProp(el, key, prev, next);
        }
    }
    // 老的属性需要赋值为初始默认值，这个还是需要判断一下的
    for (const key in oldProps) {
        if (key !== 'key' && newProps[key] == null) {
            patchDomProp(el, key, oldProps[key], null);
        }
    }
}

function patchDomProp(container, key, prev, next) {
    if(key === 'class') {
        // class定义比较简单，这里没有太多的其他逻辑
        container.className = next || '';
    } else if(key === 'style') {
        if (!next) {
            container.removeAttribute('style');
        } else {
            for (const styleName in next) {
                container.style[styleName] = next[styleName];
            }
            if (prev) {
                for (const styleName in prev) {
                    if (next[styleName] == null) {
                        container.style[styleName] = '';
                    }
                }
            }
        }
    } else {
        if(/^on[^a-z]/.test(key)) {
            // 事件处理
            const eventName = key.slice(2).toLowerCase();
            if (prev) {
                container.removeEventListener(eventName, prev);
            }
            if (next) {
                container.addEventListener(eventName, next);
            }
        } else if(domPropsRE.test(key)) {
            // 特殊属性处理
            if(next === '' && isBoolean(container[key])) {
                next = true;
            }
            container[key] = next
        } else {
            // 常规或自定义属性处理
            if(next === null || next === false) {
                container.removeAttribute(key);
            } else {
                container.setAttribute(key, next);
            }
        }
    }
}