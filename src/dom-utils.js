import { TEXT } from "./createElement";

/**
 * @typedef {{
 *   props: Record<string, any> & Record<"children", EractElement[]>;
 *   type: string | (arg: object) => EractElement;
 * }} EractElement
 *
 * @typedef {{
 *   domNode: HTMLElement;
 *   el: EractElement;
 *   childrenInstances: Instance[];
 *   publicInstance?: { render(): EractElement; props: object; };
 * }} Instance
 */

/**
 * @type {Instance | null}
 */
let rootInstance = null;

/**
 * Render an `EractElement` onto the DOM.
 *
 * @param {EractElement} el
 * @param {HTMLElement} parent
 */
export function render(el, parent) {
  const prev = rootInstance;
  const next = reconcile(parent, prev, el);
  rootInstance = next;
}

/**
 * @param {string} propName
 *
 * @returns {boolean} whether `propName` is an `onSomeEvent` prop
 */
function isEventProp(propName) {
  return propName.startsWith("on");
}

/**
 * @param {string} propName
 *
 * @returns {boolean} whether `propName` relates to an intrinsic DOM attribute
 */
function isAttributeProp(propName) {
  return propName !== "children" && !propName.startsWith("on");
}

/**
 * Render DOM updates based off of props.
 *
 * @param {HTMLElement} domNode the DOM node to alter
 * @param {EractElement["props"]} prevProps the previous props
 * @param {EractElement["props"]} nextProps the new, updated props
 */
function updateDOMProperties(domNode, prevProps, nextProps) {
  const prevKeys = Object.keys(prevProps);

  prevKeys.filter(isEventProp).forEach((value) => {
    domNode.removeEventListener(
      value.substring(2).toLowerCase(),
      prevProps[value]
    );
  });

  prevKeys.filter(isAttributeProp).forEach((value) => {
    domNode[value] = null;
  });

  const nextKeys = Object.keys(nextProps);

  nextKeys.filter(isEventProp).forEach((value) => {
    domNode.addEventListener(
      value.substring(2).toLowerCase(),
      nextProps[value]
    );
  });

  nextKeys.filter(isAttributeProp).forEach((value) => {
    domNode[value] = nextProps[value];
  });
}

/**
 * Responsible for deciding how to update the DOM based off of an existing `Instance`
 * and an updated `EractElement`.
 *
 * @param {HTMLElement} parent the parent DOM node
 * @param {Instance | null} instance the existing instance
 * @param {EractElement | null} el the new element
 */
export function reconcile(parent, instance, el) {
  if (instance === null) {
    if (el === null) throw "Cannot reconcile `null` with `null`";
    const newInstance = instantiate(el);
    parent.appendChild(newInstance.domNode);
    return newInstance;
  } else if (el === null) {
    parent.removeChild(instance.domNode);
    return null;
  } else if (instance.el.type !== el.type) {
    const newInstance = instantiate(el);
    parent.replaceChild(newInstance.domNode, instance.domNode);
    return newInstance;
  } else if (typeof el.type === "string") {
    updateDOMProperties(instance.domNode, instance.el.props, el.props);
    instance.childrenInstances = reconcileChildren(instance, el);
    instance.el = el;
    return instance;
  } else {
    instance.publicInstance.props = el.props;
    const childEl = instance.publicInstance.render();
    const childInstance = reconcile(parent, instance, childEl);
    Object.assign(instance, {
      domNode: childInstance.domNode,
      el,
      childrenInstances: childInstance.childrenInstances,
    });
    return instance;
  }
}

/**
 * Creates a new `Instance` from an `EractElement`.
 *
 * @param {EractElement} el the element to instantiate
 *
 * @returns {Instance} the usable instance
 */
function instantiate(el) {
  const { type, props } = el;

  if (typeof type !== "string") {
    const instance = {};
    const publicInstance = createPublicInstance(el, instance);
    const childEl = publicInstance.render();
    const childInstance = instantiate(childEl);
    Object.assign(instance, {
      domNode: childInstance.domNode,
      el,
      childrenInstances: childInstance.childrenInstances,
      publicInstance,
    });
    return instance;
  }

  const isTextElement = type === TEXT;

  const domNode = isTextElement
    ? document.createTextNode(el.props.value)
    : document.createElement(type);

  updateDOMProperties(domNode, {}, props);

  const { children = [] } = props;
  const childrenInstances = children.map(instantiate);

  childrenInstances.forEach((instance) => {
    domNode.appendChild(instance.domNode);
  });

  return {
    domNode,
    el,
    childrenInstances,
  };
}

/**
 * In the case where the existing instance and the new element have the same type,
 * reconciles between their children so only they need to be replaced.
 *
 * @param {Instance} instance the existing instance
 * @param {EractElement} el the new element
 */
function reconcileChildren(instance, el) {
  /**
   * @type {Instance[]}
   */
  const newChildrenInstances = [];

  const count = Math.max(
    instance.childrenInstances.length,
    el.props.children.length
  );

  for (let i = 0; i < count; i++) {
    const childInstance = instance.childrenInstances[i];
    const childElement = el.props.children[i];
    const newInstance = reconcile(
      instance.domNode,
      childInstance,
      childElement
    );
    newChildrenInstances.push(newInstance);
  }

  return newChildrenInstances.filter(Boolean);
}

/**
 * @template T
 * @param {{ props: T; type: { new(arg: T): { render(): EractElement; } } }} el
 * @param {object} instance
 */
function createPublicInstance(el, instance) {
  const { type, props } = el;
  const publicInstance = new type(props);
  publicInstance.__internalInstance = instance;
  return publicInstance;
}
