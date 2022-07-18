
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    function isString(target) {
        return typeof target === 'string';
    }
    function isNumber(target) {
        return typeof target === 'number';
    }
    function isBoolean(target) {
        return typeof target === 'boolean';
    }

    // 此处用来标识不同的节点类型
    var ShapeFlags;
    (function (ShapeFlags) {
        ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
        ShapeFlags[ShapeFlags["TEXT"] = 2] = "TEXT";
        ShapeFlags[ShapeFlags["FRAGMENT"] = 4] = "FRAGMENT";
        ShapeFlags[ShapeFlags["COMPONENT"] = 8] = "COMPONENT";
        ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 16] = "TEXT_CHILDREN";
        ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 32] = "ARRAY_CHILDREN";
        ShapeFlags[ShapeFlags["CHILDREN"] = 48] = "CHILDREN";
    })(ShapeFlags || (ShapeFlags = {}));
    const Text = Symbol('Text');
    const Fragment = Symbol('Fragment');
    function h(type, props, children) {
        let shapeFlag = 0;
        if (isString(type)) {
            shapeFlag = ShapeFlags.ELEMENT;
        }
        else if (type === Text) {
            shapeFlag = ShapeFlags.TEXT;
        }
        else if (type === Fragment) {
            shapeFlag = ShapeFlags.FRAGMENT;
        }
        else {
            shapeFlag = ShapeFlags.COMPONENT;
        }
        if (isString(children) || isNumber(children)) {
            shapeFlag |= ShapeFlags.TEXT_CHILDREN;
            children = children.toString();
        }
        else if (Array.isArray(children)) {
            shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
        }
        return {
            type,
            props,
            children,
            shapeFlag,
            el: null
        };
    }

    const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
    function patchProps(oldProps, newProps, el) {
        if (oldProps === newProps) {
            return;
        }
        newProps = newProps || {};
        oldProps = oldProps || {};
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
        for (const key in oldProps) {
            if (key !== 'key' && newProps[key] == null) {
                patchDomProp(el, key, oldProps[key], null);
            }
        }
    }
    function patchDomProp(container, key, prev, next) {
        if (key === 'class') {
            // class定义比较简单，这里没有太多的其他逻辑
            container.className = next || '';
        }
        else if (key === 'style') {
            if (!next) {
                container.removeAttribute('style');
            }
            else {
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
        }
        else {
            if (/^on[^a-z]/.test(key)) {
                // 事件处理
                const eventName = key.slice(2).toLowerCase();
                if (prev) {
                    container.removeEventListener(eventName, prev);
                }
                if (next) {
                    container.addEventListener(eventName, next);
                }
            }
            else if (domPropsRE.test(key)) {
                // 特殊属性处理
                if (next === '' && isBoolean(container[key])) {
                    next = true;
                }
                container[key] = next;
            }
            else {
                // 常规或自定义属性处理
                if (next === null || next === false) {
                    container.removeAttribute(key);
                }
                else {
                    container.setAttribute(key, next);
                }
            }
        }
    }

    function render(vnode, container) {
        const prevVNode = container._vode;
        if (!vnode) {
            if (prevVNode)
                unmount(prevVNode);
        }
        else {
            patch(prevVNode, vnode, container);
        }
        container._vode = vnode;
    }
    function unmount(vnode) {
        const { shapeFlag, el } = vnode;
        if (shapeFlag & ShapeFlags.COMPONENT) {
            unmountComponent();
        }
        else if (shapeFlag & ShapeFlags.FRAGMENT) {
            unmountFragment(vnode);
        }
        else {
            el.parentNode.removeChild(el);
        }
    }
    function patch(prevVNode, vnode, container, anchor) {
        if (prevVNode && isSameVnode(prevVNode, vnode)) {
            unmount(prevVNode);
            prevVNode = null;
        }
        const { shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.COMPONENT) {
            processComponent();
        }
        else if (shapeFlag & ShapeFlags.TEXT) {
            processText(prevVNode, vnode, container, anchor);
        }
        else if (shapeFlag & ShapeFlags.FRAGMENT) {
            processFragment(prevVNode, vnode, container, anchor);
        }
        else {
            processElement(prevVNode, vnode, container, anchor);
        }
    }
    function isSameVnode(prevVNode, vnode) {
        return prevVNode.type === vnode.type;
    }
    function processComponent(prevVNode, vnode, container) {
        throw new Error("Function not implemented.");
    }
    function processText(prevVNode, vnode, container, anchor) {
        if (prevVNode) {
            vnode.el = prevVNode.el;
            prevVNode.el.textContent = vnode.children;
        }
        else {
            mountTextNode(vnode, container, anchor);
        }
    }
    function processFragment(prevVNode, vnode, container, anchor) {
        const fragmentStartAnchor = (vnode.el = prevVNode
            ? prevVNode.el
            : document.createTextNode(''));
        const fragmentEndAnchor = (vnode.anchor = prevVNode
            ? prevVNode.anchor
            : document.createTextNode(''));
        if (prevVNode) {
            patchChildren(prevVNode, vnode, container, fragmentEndAnchor);
        }
        else {
            container.insertBefore(fragmentStartAnchor, anchor);
            container.insertBefore(fragmentEndAnchor, anchor);
            mountChildren(vnode.children, container, fragmentEndAnchor);
        }
    }
    function processElement(prevVNode, vnode, container, anchor) {
        if (prevVNode) {
            patchElement(prevVNode, vnode);
        }
        else {
            mountElement(vnode, container, anchor);
        }
    }
    function mountTextNode(vnode, container, anchor) {
        const textNode = document.createTextNode(vnode.children);
        container.insertBefore(textNode, anchor);
        vnode.el = textNode;
    }
    function mountElement(vnode, container, anchor) {
        const { type, props, shapeFlag, children } = vnode;
        const el = document.createElement(type);
        patchProps(null, props, el);
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            mountTextNode(vnode, el);
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el);
        }
        container.insertBefore(el, anchor);
        vnode.el = el;
    }
    function mountChildren(children, container, anchor) {
        children.forEach(childVnode => {
            patch(null, childVnode, container, anchor);
        });
    }
    function patchElement(prevVNode, vnode, container) {
        vnode.el = prevVNode.el;
        patchProps(prevVNode.props, vnode.props, vnode.el);
        patchChildren(prevVNode, vnode, vnode.el);
    }
    function unmountChildren(children) {
        children.forEach(child => {
            unmount(child);
        });
    }
    function patchChildren(prevVNode, vnode, container, anchor) {
        const { shapeFlag: prevShapeFlag, children: c1 } = prevVNode;
        const { shapeFlag, children: c2 } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1);
            }
            if (c2 !== c1) {
                container.textContent = c2;
            }
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                container.textContent = '';
                mountChildren(c2, container, anchor);
            }
            else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                patchArrayChildren(c1, c2, container, anchor);
            }
            else {
                mountChildren(c2, container, anchor);
            }
        }
        else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                container.textContent = '';
            }
            else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1);
            }
        }
    }
    function patchArrayChildren(c1, c2, container, anchor) {
        const oldLength = c1.length;
        const newLength = c2.length;
        const commonLength = Math.min(oldLength, newLength);
        for (let i = 0; i < commonLength; i++) {
            patch(c1[i], c2[2], container);
        }
        if (oldLength > newLength) {
            unmountChildren(c1.slice(commonLength));
        }
        else {
            mountChildren(c2.slice(commonLength), container, anchor);
        }
    }
    function unmountComponent(vnode) {
        throw new Error("Function not implemented.");
    }
    function unmountFragment(vnode) {
        let { el: cur, anchor: end } = vnode;
        const { parentNode } = cur;
        while (cur !== end) {
            let next = cur.nextSibling;
            parentNode.removeChild(cur);
            cur = next;
        }
        parentNode.removeChild(end);
    }

    function test3 () {
        render(h('ul', null, [
            h('li', null, 1),
            h(Fragment, null, []),
            h('li', null, 3),
            h('li', null, 4),
        ]), document.body);
        setTimeout(() => {
            render(h('ul', null, [
                h('li', null, 1),
                h(Fragment, null, [h('li', null, 2)]),
                h('li', null, 3),
                h('li', null, 4),
            ]), document.body);
        }, 4000);
    }

    test3();

})();
//# sourceMappingURL=mini-vue.js.map
