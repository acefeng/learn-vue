import { isBoolean } from "../util";
import { ShapeFlags, VNode } from "./vnode";

export function render(vnode: VNode, container) {
    mount(vnode, container);
}

// 根据不同的vnode生成相应的真实dom节点
function mount(vnode: VNode, container) {
    const { shapeFlag } = vnode;
    if(shapeFlag & ShapeFlags.ELEMENT) {
        mountElement(vnode, container);
    } else if(shapeFlag & ShapeFlags.TEXT) {
        mountTextNode(vnode, container);
    } else if(shapeFlag & ShapeFlags.FRAGMENT) {
        mountFragment(vnode, container);
    } else {
        mountComponent(vnode, container);
    }
}

function mountElement(vnode: VNode, container: any) {
    const { type, props, children } = vnode;
    const el = document.createElement(type);
    mountProps(props, el);
    mountChildren(vnode, el);
    container.appendChild(el);
}
function mountTextNode(vnode: VNode, container: any) {
    const textNode = document.createTextNode(vnode.children as string);
    container.appendChild(textNode);
}

function mountFragment(vnode: VNode, container: any) {
    mountChildren(vnode, container);
}
function mountComponent(vnode: VNode, container: any) {
    
}

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
function mountProps(props: any, container: any) {
    for(const key in props) {
        let value = props[key];
        if(key === 'class') {
            // class定义比较简单，这里没有太多的其他逻辑
            container.className = value;
        } else if(key === 'style') {
            // style样式处理
            for(const styleName in value) {
                container.style[styleName] = value[styleName];
            }
        } else {
            if(/^on[^a-z]/.test(key)) {
                // 事件处理
                const eventName = key.slice(2).toLowerCase();
                container.addEventListener(eventName, value);
            } else if(domPropsRE.test(key)) {
                // 特殊属性处理
                if(value === '' && isBoolean(container[key])) {
                    value = true;
                }
                container[key] = value
            } else {
                // 常规或自定义属性处理
                if(value === null || value === false) {
                    container.removeAttribute(key);
                } else {
                    container.setAttribute(key, value);
                }
            }
        }
    }
}

function mountChildren(vnode: VNode, container: any) {
    const { shapeFlag, children } = vnode;
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        mountTextNode(vnode, container)
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        (children as any[]).forEach(child => {
            mount(child, container);
        });
    }
}

