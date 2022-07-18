import { h, Text, Fragment } from '../runtime/vnode';
import { render } from '../runtime/render';

export default function() {
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
