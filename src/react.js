import { INVALID } from "./common/utils";

/**
 * @typedef {{
 *   type: string | ((props: any) => EractElement)
 *   props: Record<string, any> & Record<"children", EractElement[]>,
 *   readonly $$typeof: unique symbol
 * }} EractElement
 *
 * @typedef {{
 *  eractEl: EractElement,
 *  domNode: HTMLElement,
 *  childInstances: EractInstance[],
 *  __previousReturn?: EractInstance,
 * }} EractInstance
 */

const TEXT = "TEXT";
const $$typeof = Symbol.for("eract.element");

const React = {
  /**
   * createElement.
   *
   * @param {EractElement["type"]} type
   * @param {EractElement["props"] | null} props
   * @param {Array<EractElement | string>} children
   *
   * @returns {EractElement}
   */
  createElement(type, props, ...children) {
    props = Object.assign({}, props);

    props.children = children
      .filter((child) => child != null && child !== false)
      .map((child) => {
        if (typeof child === "string" || typeof child === "number") {
          return React.createElement(TEXT, { nodeValue: String(child) });
        } else if (
          child &&
          typeof child === "object" &&
          child.$$typeof === $$typeof
        ) {
          return child;
        } else {
          INVALID(`invalid child type: ${typeof child}`);
        }
      });

    return {
      type,
      props,
      $$typeof,
    };
  },
};

export default React;

/**
 * @type {EractInstance | null}
 */
let rootInstance = null;

/**
 * @type {(() => void) | null}
 */
let rerender = null;

/**
 * @type {unknown[]}
 */
const hooks = [];

/**
 * @type {number}
 */
let hookCursor = 0;

/**
 * @type {(() => void)[]}
 */
const cleanups = [];

/**
 * render.
 *
 * @param {EractElement} eractEl
 * @param {HTMLElement} domNode
 */
export function render(eractEl, domNode) {
  if (!rerender) {
    rerender = function() {
      hookCursor = 0;
      render(eractEl, domNode);
    };
  }

  const prevInstance = rootInstance;
  const nextInstance = reconcile(domNode, prevInstance, eractEl);
  rootInstance = nextInstance;
}

/**
 * reconcile.
 *
 * @param {HTMLElement} domNode
 * @param {EractInstance | null} instance
 * @param {EractElement | null} eractEl
 */
function reconcile(domNode, instance, eractEl) {
  if (instance == null) {
    //? no instance already exists

    if (eractEl == null) INVALID("Cannot reconcile `null` with `null`");

    //* create a new instance
    const newInstance = instantiate(eractEl);
    //* add it to the DOM
    domNode.appendChild(newInstance.domNode);
    //* return it
    return newInstance;
  } else if (eractEl == null) {
    //? the element no longer exists

    //* remove it from the DOM
    domNode.removeChild(instance.domNode);
    //* return `null`
    return null;
  } else if (eractEl.type !== instance.eractEl.type) {
    //? the element has a different type than the instance

    //* assume we need to overwrite the DOM element completely;
    //* make a new instance
    const newInstance = instantiate(eractEl);
    //* replace it in the DOM
    domNode.replaceChild(newInstance.domNode, instance.domNode);
    //* return it
    return newInstance;
  } else if (typeof eractEl.type === "string") {
    //? the element is not a component

    //* update the DOM with the new props
    updateDOMProps(instance.domNode, instance.eractEl.props, eractEl.props);
    //* update the instance with the new element
    instance.eractEl = eractEl;
    //* update the instance's children by reconciling them with the element's children
    instance.childInstances = reconcileChildren(instance, eractEl);
    //* return the updated instance
    return instance;
  } else if (typeof eractEl.type === "function") {
    //? the element is a component

    //* call the component
    const returned = eractEl.type(eractEl.props);
    //* reconcile the returned value with the previous returned value
    reconcile(domNode, instance.__previousReturn, returned);
    //* update the element stored within the instance
    instance.eractEl = eractEl;
    //* return it
    return instance;
  } else {
    INVALID("illegal reconciliation");
  }
}

/**
 * instantiate.
 *
 * @param {EractElement} eractEl
 *
 * @returns {EractInstance}
 */
function instantiate(eractEl) {
  const { type, props } = eractEl;

  if (typeof type === "function") {
    const returned = type(props);
    const instance = instantiate(returned);

    return {
      domNode: instance.domNode,
      childInstances: instance.childInstances,
      eractEl,
      __previousReturn: instance,
    };
  }

  const domNode =
    type === TEXT
      ? document.createTextNode(props.nodeValue)
      : document.createElement(type);

  updateDOMProps(domNode, {}, props);

  const childInstances = props.children.map(instantiate);
  childInstances.forEach((child) => {
    domNode.appendChild(child.domNode);
  });

  return {
    domNode,
    childInstances,
    eractEl,
  };
}

/**
 * updateDOMProps.
 *
 * @param {HTMLElement} domNode
 * @param {EractElement["props"]} nextProps
 */
function updateDOMProps(domNode, prevProps, nextProps) {
  const prevKeys = Object.keys(prevProps).filter(
    (key) => prevProps[key] !== nextProps[key]
  );

  prevKeys.filter(isEventProp).forEach((key) => {
    const event = key.toLowerCase().slice(2);
    domNode.removeEventListener(event, prevProps[key]);
  });

  prevKeys.filter(isAttribProp).forEach((key) => {
    domNode[key] = null;
  });

  const nextKeys = Object.keys(nextProps).filter(
    (key) => prevProps[key] !== nextProps[key]
  );

  nextKeys.filter(isEventProp).forEach((key) => {
    const event = key.toLowerCase().slice(2);
    domNode.addEventListener(event, nextProps[key]);
  });

  nextKeys.filter(isAttribProp).forEach((key) => {
    domNode[key] = nextProps[key];
  });
}

/**
 * isEventProp.
 *
 * @param {string} key
 */
function isEventProp(key) {
  return key.startsWith("on");
}

/**
 * isAttribProp.
 *
 * @param {string} key
 */
function isAttribProp(key) {
  return !key.startsWith("on") && key !== "children";
}

/**
 * useState.
 *
 * @template T
 *
 * @param {T | (() => T)} initialState
 *
 * @returns {[T, (newState: T | ((prev: T) => T)) => void]}
 */
export function useState(initialState) {
  const cursor = hookCursor++;

  if (hooks[cursor] === undefined || hooks[cursor] === null) {
    hooks[cursor] =
      initialState instanceof Function ? initialState() : initialState;
  }

  /**
   * setState.
   *
   * @param {T | ((prev: T) => T)} newState
   */
  function setState(newState) {
    hooks[cursor] =
      newState instanceof Function ? newState(hooks[cursor]) : newState;

    if (!rerender) INVALID("useState not called inside a component!");

    rerender();
  }

  return [hooks[cursor], setState];
}

/**
 * useEffect.
 *
 * @param {() => void | (() => void)} cb
 * @param {unknown[] | undefined} deps
 */
export function useEffect(cb, deps) {
  const cursor = hookCursor++;

  let hasChanged = true;

  if (hooks[cursor]) {
    hasChanged =
      !deps || deps.some((dep, i) => !Object.is(dep, hooks[cursor][i]));
  }

  if (hasChanged && cleanups[cursor]) {
    cleanups[cursor]();
  }

  hooks[cursor] = deps;

  if (hasChanged) {
    const cleanup = cb();
    if (cleanup) cleanups[cursor] = cleanup;
  }
}

/**
 * reconcileChildren.
 *
 * @param {EractInstance} instance
 * @param {EractElement} eractEl
 */
function reconcileChildren(instance, eractEl) {
  /**
   * @type {EractInstance[]}
   */
  const newChildInstances = [];

  const childrenCount = Math.max(
    instance.childInstances.length,
    eractEl.props.children.length
  );

  for (let i = 0; i < childrenCount; i++) {
    const instanceChild = instance.childInstances[i] ?? null;
    const elementChild = eractEl.props.children[i] ?? null;

    const newInstance = reconcile(
      instance.domNode,
      instanceChild,
      elementChild
    );

    newChildInstances.push(newInstance);
  }

  return newChildInstances.filter((child) => child != null);
}
