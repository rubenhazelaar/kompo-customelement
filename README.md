# Kompo Custom Element

This repository let's Kompo work with custom elements according to the new v1 specification. It also polyfills this specification. 
More information about the polyfill can be found here: [https://github.com/webcomponents/custom-element](https://github.com/webcomponents/custom-elements). 

Beware the polyfill is still in alpha, so use with care.

## Kompo

Kompo is a react js like library which tries to stay as simple as possible. No virtual DOM or JSX. 
Kompo loves the DOM & makes it possible to build interfaces through components.

[Check out Kompo](https://github.com/rubenhazelaar/kompo)
 
## Install

```bash
npm install --save kompo-customelement
```

## Build

```bash
npm run build
```

Need the UMD or minified build? Use:

```bash
npm run build:umd
```

```bash 
npm run build:min
```

Build the examples with the following command:

```bash
npm run examples:build

```
Or use the one below if you want to experiment.

```bash
npm run examples:watch
```

## Test

```bash
npm test
```

Please note: testing is still a work-in-progress and you can help out! Please check out the 'Contribute' section below.

## How to use

The following example covers the basics of using custom elements with Kompo:
  
```javascript
import component from 'kompo';
import custom from 'kompo-customelement';

// Create a custom element according to the v1 spec
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
        // Parse props from attribute
        if(!this.hasOwnProperty('kompo')) {
            kompo(this);
            this.kompo.props = JSON.parse(this.getAttribute('data-props'));
        }
        render(this);
    }

    // Construct the internal workings of the component
    create({text}) {
        const h1 = this.children[0] || document.createElement('h1'),
            p = this.children[1] || document.createElement('p');

        p.textContent = text;

        this.appendChild(h1);
        this.appendChild(p);
    }
}

// Create a Kompo component of the custom element.
// This will also register the custom-element
const Foo = custom('x-foo', CustomFoo, {
    text: 'This is a custom foo element'
});

// Create an instance of the component
const foo = Foo();

// Append it to the document
document.body.appendChild(foo);

```

## Todo

- Create some helper functions to make it easy to couple attributes to props

## Contribute

Would you like to contribute? Great!

Please keep the following in mind:

* Please follow the existing code style.  You can also use `npm run lint` to help.
* Write your code in a fashion which is easy to read and understand.
* Commit your changes by using `npm run commit`.
* Create pull requests for proposals or possible additions to the code base.
* Testing, testing, testing. Still a lot of work here. However each feature should come with a test.
