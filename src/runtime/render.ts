import { isBoolean } from "../util";
import { ShapeFlags, VNode } from "./vnode";
import { patchProps } from "./patchProps";

export function render(vnode: VNode, container) {
    // 对同一个dom进行赋值的时候进行简单版本的diff比较
    const prevVNode = container._vode;
    if(!vnode) {
        if(prevVNode) unmount(prevVNode);
    } else {
        patch(prevVNode, vnode, container);
    }
    
    container._vode = vnode;
}

function unmount(vnode: any) {
    const { shapeFlag, el } = vnode;
    // 依据节点不同，进行不同的卸载操作
    if(shapeFlag & ShapeFlags.COMPONENT) {
        unmountComponent(vnode);
    } else if(shapeFlag & ShapeFlags.FRAGMENT) {
        unmountFragment(vnode);
    } else {
        el.parentNode.removeChild(el);
    }
}
function patch(prevVNode: any, vnode: VNode, container: any, anchor?: any) {
    if(prevVNode && !isSameVnode(prevVNode, vnode)) {
        // 这里主要是因为再diff的时候  我们需要找准anchor 以便于确定当前节点所应该insert的位置具体是哪
        // 如果anchor存在的时候说明存在于fragment、否则就取当前节点的下一个兄弟节点
        anchor = (prevVNode.anchor || prevVNode.el).nextSibling;
        // 两种节点如果类型不同的话  那么说明老的节点必定需要卸载掉
        unmount(prevVNode);
        prevVNode = null;
    }
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(prevVNode, vnode, container);
    } else if (shapeFlag & ShapeFlags.TEXT) {
        processText(prevVNode, vnode, container, anchor);
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        processFragment(prevVNode, vnode, container, anchor);
    } else {
        processElement(prevVNode, vnode, container, anchor);
    }
}

function isSameVnode(prevVNode: any, vnode: VNode) {
    return prevVNode.type === vnode.type;
}

function processComponent(prevVNode: any, vnode: VNode, container: any) {
    throw new Error("Function not implemented.");
}

function processText(prevVNode: any, vnode: VNode, container: any, anchor: any) {
    // text节点修改比较简单，同样都是text节点 老节点存在直接替换文字就可以，不存在就mount
    if(prevVNode) {
        vnode.el = prevVNode.el;
        prevVNode.el.textContent = vnode.children;
    } else {
        mountTextNode(vnode, container, anchor);
    }
}

function processFragment(prevVNode: any, vnode: VNode, container: any, anchor: any) {
    // Fragment 属于比较特殊的东西，create的节点是用来定位frament内部的节点应该在哪用的。
    const fragmentStartAnchor = (vnode.el = prevVNode
        ? prevVNode.el
        : document.createTextNode(''));
    const fragmentEndAnchor = (vnode.anchor = prevVNode
        ? prevVNode.anchor
        : document.createTextNode(''));
    if (prevVNode) {
        patchChildren(prevVNode, vnode, container, fragmentEndAnchor);
    } else {
        container.insertBefore(fragmentStartAnchor, anchor);
        container.insertBefore(fragmentEndAnchor, anchor);
        mountChildren(vnode.children, container, fragmentEndAnchor);
    }
}

function processElement(prevVNode: any, vnode: VNode, container: any, anchor: any) {
    if(prevVNode) {
        patchElement(prevVNode, vnode, container);
    } else {
        mountElement(vnode, container, anchor);
    }
}


function mountTextNode(vnode: VNode, container: any, anchor?: any) {
    const textNode = document.createTextNode(vnode.children as string);
    container.insertBefore(textNode, anchor);
    vnode.el = textNode;
}

function mountElement(vnode: VNode, container: any, anchor: any) {
    const { type, props, shapeFlag, children } = vnode;
    const el = document.createElement(type);
    patchProps(null, props, el);
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        mountTextNode(vnode, el)
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }
    container.insertBefore(el, anchor);
    vnode.el = el;
}

function mountChildren(children: any, container: any, anchor?: any) {
    (children as any[]).forEach(childVnode => {
        patch(null, childVnode, container, anchor)
    });
}

function patchElement(prevVNode: any, vnode: VNode, container: any) {
    vnode.el = prevVNode.el;
    // patch一下props 这个东西需要重新处理
    patchProps(prevVNode.props, vnode.props, vnode.el);
    // 这里说明子节点肯定是有数组的
    patchChildren(prevVNode, vnode, vnode.el);
}

function unmountChildren(children) {
    (children as any[]).forEach(child => {
        unmount(child);
    });
}

function patchChildren(prevVNode: any, vnode: VNode, container: any, anchor?: any) {
    const { shapeFlag: prevShapeFlag, children: c1 } = prevVNode;
    const { shapeFlag, children: c2 } = vnode;
    // 子节点的处理方式比较复杂，直接去看图吧。一共有3 * 3种的情况
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(c1);
          }
          if (c2 !== c1) {
            container.textContent = c2;
          }
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 文字节点 去掉文字内容
            container.textContent = '';
            mountChildren(c2, container, anchor);
          } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            patchArrayChildren(c1, c2, container, anchor);
          } else {
            // 新建节点
            mountChildren(c2, container, anchor);
          }
    } else { // vnode 为 null
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            container.textContent = '';
        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(c1);
        }
    }
}

function patchArrayChildren(c1: any, c2: any, container: any, anchor: any) {
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    /**
     * 这里的diff算法很简单  取出两种最短的长度，然后从第一个位置向后进行遍历patch，替换节点或者生成、删除节点
     * 剩下的内容通过长度来判断是要全都卸载  还是全都新建
     * 这里暂时没有考虑完整的diff算法之类的，也没有老的节点继续使用的代码，只是先实现功能
    */
    for(let i = 0; i < commonLength; i++) {
        patch(c1[i], c2[2], container);
    }
    if(oldLength > newLength) {
        unmountChildren(c1.slice(commonLength));
    } else {
        mountChildren(c2.slice(commonLength), container, anchor);
    }
}

function unmountComponent(vnode: any) {
    throw new Error("Function not implemented.");
}

function unmountFragment(vnode: any) {
    let { el: cur, anchor: end } = vnode;
    const { parentNode } = cur;
    while (cur !== end) {
        let next = cur.nextSibling;
        parentNode.removeChild(cur);
        cur = next;
    }
    parentNode.removeChild(end);
}
