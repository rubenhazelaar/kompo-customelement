(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["kompo-customelement"] = factory();
	else
		root["kompo-customelement"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * @license
	 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
	 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	 * Code distributed by Google as part of the polymer project is also
	 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	 */
	
	/**
	 * 2.3
	 * http://w3c.github.io/webcomponents/spec/custom/#dfn-element-definition
	 * @typedef {{
	 *  name: string,
	 *  localName: string,
	 *  constructor: function(new:HTMLElement),
	 *  connectedCallback: (Function|undefined),
	 *  disconnectedCallback: (Function|undefined),
	 *  attributeChangedCallback: (Function|undefined),
	 *  observedAttributes: Array<string>,
	 * }}
	 */
	var CustomElementDefinition = void 0;
	
	/**
	 * @typedef {{
	 *  resolve: !function(undefined),
	 *  promise: !Promise<undefined>,
	 * }}
	 */
	var Deferred = void 0;
	
	(function () {
	  'use strict';
	
	  var doc = document;
	  var win = window;
	
	  var _observerProp = '__CustomElements_observer__';
	  var _attachedProp = '__CustomElements_attached__';
	  var _upgradedProp = '__CustomElements_upgraded__';
	
	  if (win['customElements']) {
	    if (win['customElements'].enableFlush) {
	      win['customElements'].flush = function () {
	        console.log('CustomElements#flush()');
	      };
	    }
	    if (!win['customElements']['forcePolyfill']) {
	      return;
	    }
	  }
	
	  // name validation
	  // https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name
	
	  /**
	   * @const
	   * @type {Array<string>}
	   */
	  var reservedTagList = ['annotation-xml', 'color-profile', 'font-face', 'font-face-src', 'font-face-uri', 'font-face-format', 'font-face-name', 'missing-glyph'];
	
	  /** @const */
	  var customNameValidation = /^[a-z][.0-9_a-z]*-[\-.0-9_a-z]*$/;
	
	  /**
	   * @param {!string} name
	   * @return {boolean}
	   */
	  function isValidCustomElementName(name) {
	    return customNameValidation.test(name) && reservedTagList.indexOf(name) === -1;
	  }
	
	  /**
	   * @param {!Node} root
	   * @return {TreeWalker}
	   */
	  function createTreeWalker(root) {
	    // IE 11 requires the third and fourth arguments be present. If the third
	    // arg is null, it applies the default behaviour. However IE also requires
	    // the fourth argument be present even though the other browsers ignore it.
	    return doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
	  }
	
	  /**
	   * @param {!Node} node
	   * @return {boolean}
	   */
	  function isElement(node) {
	    return node.nodeType === Node.ELEMENT_NODE;
	  }
	
	  /**
	   * @param {!Element} element
	   * @return {boolean}
	   */
	  function isHtmlImport(element) {
	    return element.tagName === 'LINK' && element.rel && element.rel.toLowerCase().split(' ').indexOf('import') !== -1;
	  }
	
	  /**
	   * @param {!Element} element
	   * @return {boolean}
	   */
	  function isConnected(element) {
	    var n = element;
	    do {
	      if (n['_attachedProp'] || n === document) return true;
	      n = n.parentNode || n.nodeType === Node.DOCUMENT_FRAGMENT_NODE && n.host;
	    } while (n);
	    return false;
	  }
	
	  /**
	   * A registry of custom element definitions.
	   *
	   * See https://html.spec.whatwg.org/multipage/scripting.html#customelementsregistry
	   *
	   * @property {boolean} enableFlush Set to true to enable the flush() method
	   *   to work. This should only be done for tests, as it causes a memory leak.
	   */
	
	  var CustomElementsRegistry = function () {
	    function CustomElementsRegistry() {
	      var _this2 = this;
	
	      _classCallCheck(this, CustomElementsRegistry);
	
	      /** @private {!Map<string, !CustomElementDefinition>} **/
	      this._definitions = new Map();
	
	      /** @private {!Map<Function, string>} **/
	      this._constructors = new Map();
	
	      /** @private {!Map<string, !Deferred>} **/
	      this._whenDefinedMap = new Map();
	
	      /** @private {!Set<!MutationObserver>} **/
	      this._observers = new Set();
	
	      /** @private {!MutationObserver} **/
	      this._attributeObserver = new MutationObserver( /** @type {function(Array<MutationRecord>, MutationObserver)} */this._handleAttributeChange.bind(this));
	
	      /** @private {?HTMLElement} **/
	      this._newInstance = null;
	
	      /** @private {!Set<string>} **/
	      this._pendingHtmlImportUrls = new Set();
	
	      /** @type {boolean} **/
	      this.enableFlush = true;
	
	      /** @private {boolean} **/
	      this._ready = false;
	
	      /** @type {MutationObserver} **/
	      this._mainDocumentObserver = this._observeRoot(document);
	
	      // TODO(justinfagnani): Possibly remove WebComponentsReady event
	      var onReady = function onReady() {
	        _this2._ready = true;
	        _this2._addNodes(doc.childNodes);
	        window.dispatchEvent(new CustomEvent('WebComponentsReady'));
	      };
	      if (window['HTMLImports']) {
	        window['HTMLImports']['whenReady'](onReady);
	      } else {
	        onReady();
	      }
	    }
	
	    // HTML spec part 4.13.4
	    // https://html.spec.whatwg.org/multipage/scripting.html#dom-customelementsregistry-define
	    /**
	     * @param {string} name
	     * @param {function(new:HTMLElement)} constructor
	     * @param {{extends: string}} options
	     * @return {undefined}
	     */
	
	
	    CustomElementsRegistry.prototype.define = function define(name, constructor, options) {
	      name = name.toString().toLowerCase();
	
	      // 1:
	      if (typeof constructor !== 'function') {
	        throw new TypeError('constructor must be a Constructor');
	      }
	
	      // 2. If constructor is an interface object whose corresponding interface
	      //    either is HTMLElement or has HTMLElement in its set of inherited
	      //    interfaces, throw a TypeError and abort these steps.
	      //
	      // It doesn't appear possible to check this condition from script
	
	      // 3:
	      if (!isValidCustomElementName(name)) {
	        throw new SyntaxError('The element name \'' + name + '\' is not valid.');
	      }
	
	      // 4, 5:
	      // Note: we don't track being-defined names and constructors because
	      // define() isn't normally reentrant. The only time user code can run
	      // during define() is when getting callbacks off the prototype, which
	      // would be highly-unusual. We can make define() reentrant-safe if needed.
	      if (this._definitions.has(name)) {
	        throw new Error('An element with name \'' + name + '\' is already defined');
	      }
	
	      // 6, 7:
	      if (this._constructors.has(constructor)) {
	        throw new Error('Definition failed for \'' + name + '\': ' + 'The constructor is already used.');
	      }
	
	      // 8:
	      /** @type {string} */
	      var localName = name;
	
	      // 9, 10: We do not support extends currently.
	
	      // 11, 12, 13: Our define() isn't rentrant-safe
	
	      // 14.1:
	      /** @type {Object} */
	      var prototype = constructor.prototype;
	
	      // 14.2:
	      if ((typeof prototype === 'undefined' ? 'undefined' : _typeof(prototype)) !== 'object') {
	        throw new TypeError('Definition failed for \'' + name + '\': ' + 'constructor.prototype must be an object');
	      }
	
	      /**
	       * @param {string} callbackName
	       * @return {Function|undefined}
	       */
	      function getCallback(callbackName) {
	        var callback = prototype[callbackName];
	        if (callback !== undefined && typeof callback !== 'function') {
	          throw new Error(localName + ' \'' + callbackName + '\' is not a Function');
	        }
	        return callback;
	      }
	
	      // 3, 4:
	      var connectedCallback = getCallback('connectedCallback');
	
	      // 5, 6:
	      var disconnectedCallback = getCallback('disconnectedCallback');
	
	      // Divergence from spec: we always throw if attributeChangedCallback is
	      // not a function.
	
	      // 7, 9.1:
	      var attributeChangedCallback = getCallback('attributeChangedCallback');
	
	      // 8, 9.2, 9.3:
	      var observedAttributes = attributeChangedCallback && constructor['observedAttributes'] || [];
	
	      // 15:
	      /** @type {CustomElementDefinition} */
	      var definition = {
	        name: name,
	        localName: localName,
	        constructor: constructor,
	        connectedCallback: connectedCallback,
	        disconnectedCallback: disconnectedCallback,
	        attributeChangedCallback: attributeChangedCallback,
	        observedAttributes: observedAttributes
	      };
	
	      // 16:
	      this._definitions.set(localName, definition);
	      this._constructors.set(constructor, localName);
	
	      // 17, 18, 19:
	      if (this._ready) this._addNodes(doc.childNodes);
	
	      // 20:
	      /** @type {Deferred} **/
	      var deferred = this._whenDefinedMap.get(localName);
	      if (deferred) {
	        deferred.resolve(undefined);
	        this._whenDefinedMap.delete(localName);
	      }
	    };
	
	    /**
	     * Returns the constructor defined for `name`, or `null`.
	     *
	     * @param {string} name
	     * @return {Function|undefined}
	     */
	
	
	    CustomElementsRegistry.prototype.get = function get(name) {
	      // https://html.spec.whatwg.org/multipage/scripting.html#custom-elements-api
	      var def = this._definitions.get(name);
	      return def ? def.constructor : undefined;
	    };
	
	    /**
	     * Returns a `Promise` that resolves when a custom element for `name` has
	     * been defined.
	     *
	     * @param {string} name
	     * @return {!Promise}
	     */
	
	
	    CustomElementsRegistry.prototype.whenDefined = function whenDefined(name) {
	      // https://html.spec.whatwg.org/multipage/scripting.html#dom-customelementsregistry-whendefined
	      if (!customNameValidation.test(name)) {
	        return Promise.reject(new SyntaxError('The element name \'' + name + '\' is not valid.'));
	      }
	      if (this._definitions.has(name)) {
	        return Promise.resolve();
	      }
	      var resolve = void 0;
	      var promise = new Promise(function (_resolve, _) {
	        resolve = _resolve;
	      });
	      /** @type {Deferred} **/
	      var deferred = { promise: promise, resolve: resolve };
	      this._whenDefinedMap.set(name, deferred);
	      return promise;
	    };
	
	    /**
	     * Causes all pending mutation records to be processed, and thus all
	     * customization, upgrades and custom element reactions to be called.
	     * `enableFlush` must be true for this to work. Only use during tests!
	     */
	
	
	    CustomElementsRegistry.prototype.flush = function flush() {
	      if (this.enableFlush) {
	        // console.warn("flush!!!");
	        this._handleMutations(this._mainDocumentObserver.takeRecords());
	        this._observers.forEach(
	        /**
	         * @param {!MutationObserver} observer
	         * @this {CustomElementsRegistry}
	         */
	        function (observer) {
	          this._handleMutations(observer.takeRecords());
	        }, this);
	      }
	    };
	
	    /**
	     * @param {?HTMLElement} instance
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._setNewInstance = function _setNewInstance(instance) {
	      this._newInstance = instance;
	    };
	
	    /**
	     * Observes a DOM root for mutations that trigger upgrades and reactions.
	     * @param {Node} root
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._observeRoot = function _observeRoot(root) {
	      console.log('_observeRoot', root, root.baseURI);
	      // console.assert(!root['_observerProp']);
	      if (root['_observerProp'] != null) {
	        console.warn('Root ' + root + ' is already observed');
	        return root['_observerProp'];
	      }
	      root['_observerProp'] = new MutationObserver( /** @type {function(Array<MutationRecord>, MutationObserver)} */this._handleMutations.bind(this));
	      root['_observerProp'].observe(root, { childList: true, subtree: true });
	      if (this.enableFlush) {
	        // this is memory leak, only use in tests
	        this._observers.add(root['_observerProp']);
	      }
	      return root['_observerProp'];
	    };
	
	    /**
	     * @param {Node} root
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._unobserveRoot = function _unobserveRoot(root) {
	      if (root['_observerProp'] != null) {
	        root['_observerProp'].disconnect();
	        if (this.enableFlush) {
	          this._observers.delete(root['_observerProp']);
	        }
	        root['_observerProp'] = null;
	      }
	    };
	
	    /**
	     * @param {!Array<!MutationRecord>} mutations
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._handleMutations = function _handleMutations(mutations) {
	      for (var i = 0; i < mutations.length; i++) {
	        /** @type {!MutationRecord} */
	        var mutation = mutations[i];
	        if (mutation.type === 'childList') {
	          // Note: we can't get an ordering between additions and removals, and
	          // so might diverge from spec reaction ordering
	          var addedNodes = /** @type {!NodeList<!Node>} */mutation.addedNodes;
	          var removedNodes = /** @type {!NodeList<!Node>} */mutation.removedNodes;
	          this._addNodes(addedNodes);
	          this._removeNodes(removedNodes);
	        }
	      }
	    };
	
	    /**
	     * @param {!(NodeList<!Node>|Array<!Node>)} nodeList
	     * @param {?Set<Node>=} visitedNodes
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._addNodes = function _addNodes(nodeList, visitedNodes) {
	      visitedNodes = visitedNodes || new Set();
	
	      for (var i = 0; i < nodeList.length; i++) {
	        var root = nodeList[i];
	
	        if (!isElement(root)) {
	          continue;
	        }
	
	        // Since we're adding this node to an observed tree, we can unobserve
	        this._unobserveRoot(root);
	
	        var walker = createTreeWalker(root);
	        do {
	          var node = /** @type {!HTMLElement} */walker.currentNode;
	          this._addElement(node, visitedNodes);
	        } while (walker.nextNode());
	      }
	    };
	
	    /**
	     * @param {!HTMLElement} element
	     * @param {!Set<Node>=} visitedNodes
	     */
	
	
	    CustomElementsRegistry.prototype._addElement = function _addElement(element, visitedNodes) {
	      if (visitedNodes.has(element)) return;
	      visitedNodes.add(element);
	
	      /** @type {?CustomElementDefinition} */
	      var definition = this._definitions.get(element.localName);
	      if (definition) {
	        if (!element['_upgradedProp']) {
	          this._upgradeElement(element, definition, true);
	        }
	        // TODO(justinfagnani): check that the element is in the document
	        if (element['_upgradedProp'] && !element['_attachedProp'] && isConnected(element)) {
	          element['_attachedProp'] = true;
	          if (definition.connectedCallback) {
	            definition.connectedCallback.call(element);
	          }
	        }
	      }
	      if (element.shadowRoot) {
	        // TODO(justinfagnani): do we need to check that the shadowRoot
	        // is observed?
	        this._addNodes(element.shadowRoot.childNodes, visitedNodes);
	      }
	      if (isHtmlImport(element)) {
	        this._addImport( /** @type {!HTMLLinkElement} */element, visitedNodes);
	      }
	    };
	
	    /**
	     * @param {!HTMLLinkElement} link
	     * @param {!Set<Node>=} visitedNodes
	     */
	
	
	    CustomElementsRegistry.prototype._addImport = function _addImport(link, visitedNodes) {
	      var _this3 = this;
	
	      // During a tree walk to add or upgrade nodes, we may encounter multiple
	      // HTML imports that reference the same document, and may encounter
	      // imports in various states of loading.
	
	      // First, we only want to process the first import for a document in a
	      // walk, so we check visitedNodes for the document, not the link.
	      //
	      // Second, for documents that haven't loaded yet, we only want to add one
	      // listener, regardless of the number of links or walks, so we track
	      // pending loads in _pendingHtmlImportUrls.
	
	      // Check to see if the import is loaded
	      /** @type {?Document} */
	      var _import = link.import;
	      if (_import) {
	        // The import is loaded, but only process the first link element
	        if (visitedNodes.has(_import)) return;
	        visitedNodes.add(_import);
	
	        // The import is loaded observe it
	        if (!_import['_observerProp']) this._observeRoot(_import);
	
	        // walk the document
	        this._addNodes(_import.childNodes, visitedNodes);
	      } else {
	        var _ret = function () {
	          // The import is not loaded, so wait for it
	          /** @type {string} */
	          var importUrl = link.href;
	          if (_this3._pendingHtmlImportUrls.has(importUrl)) return {
	              v: void 0
	            };
	          _this3._pendingHtmlImportUrls.add(importUrl);
	
	          /**
	           * @const
	           * @type {CustomElementsRegistry}
	           */
	          var _this = _this3;
	          var onLoad = function onLoad() {
	            link.removeEventListener('load', /** @type {function(Event)} */onLoad);
	            if (!link.import['_observerProp']) _this._observeRoot(link.import);
	            // We don't pass visitedNodes because this is async and not part of
	            // the current tree walk.
	            _this._addNodes(link.import.childNodes);
	          };
	          link.addEventListener('load', onLoad);
	        }();
	
	        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	      }
	    };
	
	    /**
	     * @param {NodeList} nodeList
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._removeNodes = function _removeNodes(nodeList) {
	      for (var i = 0; i < nodeList.length; i++) {
	        var root = nodeList[i];
	
	        if (!isElement(root)) {
	          continue;
	        }
	
	        // Since we're detatching this element from an observed root, we need to
	        // reobserve it.
	        // TODO(justinfagnani): can we do this in a microtask so we don't thrash
	        // on creating and destroying MutationObservers on batch DOM mutations?
	        this._observeRoot(root);
	
	        var walker = createTreeWalker(root);
	        do {
	          var node = walker.currentNode;
	          if (node['_upgradedProp'] && node['_attachedProp']) {
	            node['_attachedProp'] = false;
	            var definition = this._definitions.get(node.localName);
	            if (definition && definition.disconnectedCallback) {
	              definition.disconnectedCallback.call(node);
	            }
	          }
	        } while (walker.nextNode());
	      }
	    };
	
	    /**
	     * Upgrades or customizes a custom element.
	     *
	     * @param {HTMLElement} element
	     * @param {CustomElementDefinition} definition
	     * @param {boolean} callConstructor
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._upgradeElement = function _upgradeElement(element, definition, callConstructor) {
	      var prototype = definition.constructor.prototype;
	      element.__proto__ = prototype;
	      if (callConstructor) {
	        this._setNewInstance(element);
	        new definition.constructor();
	        element['_upgradedProp'] = true;
	        console.assert(this._newInstance == null);
	      }
	
	      var observedAttributes = definition.observedAttributes;
	      var attributeChangedCallback = definition.attributeChangedCallback;
	      if (attributeChangedCallback && observedAttributes.length > 0) {
	        this._attributeObserver.observe(element, {
	          attributes: true,
	          attributeOldValue: true,
	          attributeFilter: observedAttributes
	        });
	
	        // Trigger attributeChangedCallback for existing attributes.
	        // https://html.spec.whatwg.org/multipage/scripting.html#upgrades
	        for (var i = 0; i < observedAttributes.length; i++) {
	          var name = observedAttributes[i];
	          if (element.hasAttribute(name)) {
	            var value = element.getAttribute(name);
	            attributeChangedCallback.call(element, name, null, value);
	          }
	        }
	      }
	    };
	
	    /**
	     * @param {!Array<!MutationRecord>} mutations
	     * @private
	     */
	
	
	    CustomElementsRegistry.prototype._handleAttributeChange = function _handleAttributeChange(mutations) {
	      for (var i = 0; i < mutations.length; i++) {
	        var mutation = mutations[i];
	        if (mutation.type === 'attributes') {
	          var target = /** @type {HTMLElement} */mutation.target;
	          // We should be gaurenteed to have a definition because this mutation
	          // observer is only observing custom elements observedAttributes
	          var definition = this._definitions.get(target.localName);
	          var name = /** @type {!string} */mutation.attributeName;
	          var oldValue = mutation.oldValue;
	          var newValue = target.getAttribute(name);
	          // Skip changes that were handled synchronously by setAttribute
	          if (newValue !== oldValue) {
	            var namespace = mutation.attributeNamespace;
	            definition.attributeChangedCallback.call(target, name, oldValue, newValue, namespace);
	          }
	        }
	      }
	    };
	
	    return CustomElementsRegistry;
	  }();
	
	  // Closure Compiler Exports
	
	
	  window['CustomElementsRegistry'] = CustomElementsRegistry;
	  CustomElementsRegistry.prototype['define'] = CustomElementsRegistry.prototype.define;
	  CustomElementsRegistry.prototype['get'] = CustomElementsRegistry.prototype.get;
	  CustomElementsRegistry.prototype['whenDefined'] = CustomElementsRegistry.prototype.whenDefined;
	  CustomElementsRegistry.prototype['flush'] = CustomElementsRegistry.prototype.flush;
	  CustomElementsRegistry.prototype['polyfilled'] = true;
	  // TODO(justinfagnani): remove these in production code
	  CustomElementsRegistry.prototype['_observeRoot'] = CustomElementsRegistry.prototype._observeRoot;
	  CustomElementsRegistry.prototype['_addImport'] = CustomElementsRegistry.prototype._addImport;
	
	  // patch window.HTMLElement
	
	  /** @const */
	  var origHTMLElement = win.HTMLElement;
	  /**
	   * @type {function(new: HTMLElement)}
	   */
	  var newHTMLElement = function HTMLElement() {
	    var customElements = win['customElements'];
	
	    // If there's an being upgraded, return that
	    if (customElements._newInstance) {
	      var i = customElements._newInstance;
	      customElements._newInstance = null;
	      return i;
	    }
	    if (this.constructor) {
	      // Find the tagname of the constructor and create a new element with it
	      var tagName = customElements._constructors.get(this.constructor);
	      return doc._createElement(tagName, false);
	    }
	    throw new Error('Unknown constructor. Did you call customElements.define()?');
	  };
	  win.HTMLElement = newHTMLElement;
	  win.HTMLElement.prototype = Object.create(origHTMLElement.prototype, {
	    constructor: { value: win.HTMLElement, configurable: true, writable: true }
	  });
	
	  // patch all built-in subclasses of HTMLElement to inherit from the new HTMLElement
	  // See https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
	
	  /** @const */
	  var htmlElementSubclasses = ['Button', 'Canvas', 'Data', 'Head', 'Mod', 'TableCell', 'TableCol', 'Anchor', 'Area', 'Base', 'Body', 'BR', 'DataList', 'Details', 'Dialog', 'Div', 'DList', 'Embed', 'FieldSet', 'Form', 'Heading', 'HR', 'Html', 'IFrame', 'Image', 'Input', 'Keygen', 'Label', 'Legend', 'LI', 'Link', 'Map', 'Media', 'Menu', 'MenuItem', 'Meta', 'Meter', 'Object', 'OList', 'OptGroup', 'Option', 'Output', 'Paragraph', 'Param', 'Picture', 'Pre', 'Progress', 'Quote', 'Script', 'Select', 'Slot', 'Source', 'Span', 'Style', 'TableCaption', 'Table', 'TableRow', 'TableSection', 'Template', 'TextArea', 'Time', 'Title', 'Track', 'UList', 'Unknown'];
	
	  for (var i = 0; i < htmlElementSubclasses.length; i++) {
	    var ctor = window['HTML' + htmlElementSubclasses[i] + 'Element'];
	    if (ctor) {
	      ctor.prototype.__proto__ = win.HTMLElement.prototype;
	    }
	  }
	
	  // patch doc.createElement
	
	  /**
	   * @type {function(this:Document, string, (string|undefined)): !Element}
	   */
	  var rawCreateElement = doc.createElement;
	  doc._createElement = function (tagName, options, callConstructor) {
	    /** @type {CustomElementsRegistry} */
	    var customElements = win['customElements'];
	    var element = /** @type {!HTMLElement} **/rawCreateElement.call(doc, tagName, options);
	    var definition = customElements._definitions.get(tagName.toLowerCase());
	    if (definition) {
	      customElements._upgradeElement(element, definition, callConstructor);
	    }
	    customElements._observeRoot(element);
	    return element;
	  };
	  doc.createElement = function (tagName, options) {
	    return doc._createElement(tagName, options, true);
	  };
	
	  // patch doc.createElementNS
	
	  var HTMLNS = 'http://www.w3.org/1999/xhtml';
	
	  /** @type {function(this:Document,string,string):Element} */
	  var _origCreateElementNS = doc.createElementNS;
	  doc.createElementNS =
	  /** @type {function(this:Document,(string|null),string):!Element} */
	  function (namespaceURI, qualifiedName) {
	    if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
	      return doc.createElement(qualifiedName);
	    } else {
	      return _origCreateElementNS.call(document, namespaceURI, qualifiedName);
	    }
	  };
	
	  // patch Element.attachShadow
	
	  /** @type {function({closed: boolean})} */
	  var _origAttachShadow = Element.prototype['attachShadow'];
	  if (_origAttachShadow) {
	    Object.defineProperty(Element.prototype, 'attachShadow', {
	      value: function value(options) {
	        /** @type {!Node} */
	        var root = _origAttachShadow.call(this, options);
	        /** @type {CustomElementsRegistry} */
	        var customElements = win['customElements'];
	        customElements._observeRoot(root);
	        return root;
	      }
	    });
	  }
	
	  // patch doc.importNode
	
	  var rawImportNode = doc.importNode;
	  doc.importNode = function (node, deep) {
	    var clone = /** @type{!Node} */rawImportNode.call(doc, node, deep);
	    var customElements = win['customElements'];
	    var nodes = isElement(clone) ? [clone] : clone.childNodes;
	    /** @type {CustomElementsRegistry} */window['customElements']._addNodes(nodes);
	    return clone;
	  };
	
	  // patch Element.setAttribute & removeAttribute
	
	  var _origSetAttribute = Element.prototype.setAttribute;
	  Element.prototype['setAttribute'] = function (name, value) {
	    changeAttribute(this, name, value, _origSetAttribute);
	  };
	  var _origRemoveAttribute = Element.prototype.removeAttribute;
	  Element.prototype['removeAttribute'] = function (name) {
	    changeAttribute(this, name, null, _origRemoveAttribute);
	  };
	
	  function changeAttribute(element, name, value, operation) {
	    name = name.toLowerCase();
	    var oldValue = element.getAttribute(name);
	    operation.call(element, name, value);
	
	    // Bail if this wasn't a fully upgraded custom element
	    if (element['_upgradedProp'] == true) {
	      var definition = window['customElements']._definitions.get(element.localName);
	      var observedAttributes = definition.observedAttributes;
	      var attributeChangedCallback = definition.attributeChangedCallback;
	      if (attributeChangedCallback && observedAttributes.indexOf(name) >= 0) {
	        var newValue = element.getAttribute(name);
	        if (newValue !== oldValue) {
	          attributeChangedCallback.call(element, name, oldValue, newValue);
	        }
	      }
	    }
	  }
	
	  /** @type {CustomElementsRegistry} */
	  window['customElements'] = new CustomElementsRegistry();
	
	  // // TODO(justinfagnani): Remove. Temporary for backward-compatibility
	  window['CustomElements'] = {
	    takeRecords: function takeRecords() {
	      if (window['customElements'].flush) window['customElements'].flush();
	    }
	  };
	})();

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * @license
	 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
	 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	 * Code distributed by Google as part of the polymer project is also
	 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	 */
	
	/**
	 * This shim allows elements written in, or compiled to, ES5 to work on native
	 * implementations of Custom Elements v1. It sets new.target to the value of
	 * this.constructor so that the native HTMLElement constructor can access the
	 * current under-construction element's definition.
	 *
	 * Because `new.target` is a syntax error in VMs that don't support it, this
	 * shim must only be loaded in browsers that do.
	 */
	(function () {
	  var origHTMLElement = HTMLElement;
	  // TODO(justinfagnani): Tests!!
	  window.HTMLElement = function () {
	    // prefer new.target for elements that call super() constructors or
	    // Reflect.construct directly
	    var newTarget = new.target || this.constructor;
	    return Reflect.construct(origHTMLElement, [], newTarget);
	  };
	  HTMLElement.prototype = Object.create(origHTMLElement.prototype, {
	    constructor: { value: HTMLElement, configurable: true, writable: true }
	  });
	  // TODO(justinfagnani): patch all native subclasses of HTMLElement
	})();

/***/ }
/******/ ])
});
;
//# sourceMappingURL=main.js.map