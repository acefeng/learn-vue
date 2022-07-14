
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
            shapeFlag
        };
    }

    function render(vnode, container) {
        mount(vnode, container);
    }
    function mount(vnode, container) {
        const { shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.ELEMENT) {
            mountElement(vnode, container);
        }
        else if (shapeFlag & ShapeFlags.TEXT) {
            mountTextNode(vnode, container);
        }
        else if (shapeFlag & ShapeFlags.FRAGMENT) {
            mountFragment(vnode, container);
        }
        else ;
    }
    function mountElement(vnode, container) {
        const { type, props, children } = vnode;
        const el = document.createElement(type);
        mountProps(props, el);
        mountChildren(vnode, el);
        container.appendChild(el);
    }
    function mountTextNode(vnode, container) {
        const textNode = document.createTextNode(vnode.children);
        container.appendChild(textNode);
    }
    function mountFragment(vnode, container) {
        mountChildren(vnode, container);
    }
    const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;
    function mountProps(props, container) {
        for (const key in props) {
            let value = props[key];
            if (key === 'class') {
                container.className = value;
            }
            else if (key === 'style') {
                for (const styleName in value) {
                    container.style[styleName] = value[styleName];
                }
            }
            else {
                if (/^on[^a-z]/.test(key)) {
                    const eventName = key.slice(2).toLowerCase();
                    container.addEventListener(eventName, value);
                }
                else if (domPropsRE.test(key)) {
                    if (value === '' && isBoolean(container[key])) {
                        value = true;
                    }
                    container[key] = value;
                }
                else {
                    if (value === null || value === false) {
                        container.removeAttribute(key);
                    }
                    else {
                        container.setAttribute(key, value);
                    }
                }
            }
        }
    }
    function mountChildren(vnode, container) {
        const { shapeFlag, children } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            mountTextNode(vnode, container);
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            children.forEach(child => {
                mount(child, container);
            });
        }
    }

    function test2 () {
        render(h('div', {
            class: 'a b',
            style: {
                border: '1px solid',
                fontSize: '14px',
            },
            onClick: () => console.log('click'),
            checked: '',
            custom: false,
        }, [
            h('ul', null, [
                h('li', { style: { color: 'red' } }, 1),
                h('li', null, 2),
                h('li', { style: { color: 'blue' } }, 3),
                h('li', null, [h(Text, null, 'hello world')]),
            ]),
        ]), document.body);
    }

    test2();

})();
//# sourceMappingURL=mini-vue.js.map
