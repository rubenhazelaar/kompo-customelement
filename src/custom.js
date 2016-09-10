// @flow
import component,{util} from 'kompo';
import '@webcomponents/custom-elements';

/**
 * Constructs a custom tag and appends kompo logic.constructor.
 * It is used to create custom elements according to the v1 spec,
 * which can work together with Kompo. Refer to the examples
 * directory in this repository for an example.
 * 
 * @param tag
 * @param impl
 * @param defaultProps
 * @returns {function()}
 */
export default function custom(tag:string, impl:Element, defaultProps:props = {}):(props:props)=> KompoElement {
    window.customElements.define(tag, impl);

    return (props = {}) => {
        var c = component.kompo(new impl);
        c.kompo.props = util.merge(Object.assign({},defaultProps), props);
        return c;
    };
}

/**
 * Checks whethert the CustomElementsV1 API is available 
 * 
 * @returns {boolean}
 */
export function hasCustomElements():boolean {
    return 'customElements' in window;
}