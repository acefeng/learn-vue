import { h, Text, Fragment } from '../runtime/vnode';
import { render } from '../runtime/render';

export default function() {
    render(h(
        'div',
        {
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
        ]
    ), document.body);
}
