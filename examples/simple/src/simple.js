import {kompo, render} from 'kompo';
import custom from '../../../src/custom';

class CustomFoo extends HTMLElement {
    constructor() {
        // If you define a ctor, always call super() first!
        // This is specific to CE and required by the spec.
        super();

        // Setup a click listener on itself.
        this.addEventListener('click', e => {
            console.log('Click handler attached on construction');
        });
    }

    connectedCallback() {
        if(!this.hasOwnProperty('kompo')) {
            kompo(this);
            this.kompo.props = JSON.parse(this.getAttribute('data-props'));
        }
        render(this);
    }

    construct({text}) {
        const h1 = this.children[0] || document.createElement('h1'),
            p = this.children[1] || document.createElement('p');

        p.textContent = text;

        this.appendChild(h1);
        this.appendChild(p);
    }
}

const Foo = custom('x-foo', CustomFoo, {
    text: 'This is a custom foo element'
});

const foo = Foo();
document.body.appendChild(foo);
