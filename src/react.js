import { todo } from "./common/utils";

/**
 * @typedef {{
 *   type: string | (() => ReactElement),
 *   props: Record<string, unknown>,
 *   children: (ReactElement | string | number | true)[];
 * }} ReactElement
 *
 * @typedef {{
 *   domNode: Node;
 *   element: ReactElement;
 *   childFibers: Fiber[];
 * }} Fiber
 */

/**
 * @type {(() => void) | null}
 **/
let rerender = null;

let hookCursor = 0;
const hooks = [];

/**
 * @template {T}
 *
 * @param {T} initialState
 * @returns {[T, (updater: T | ((prev: T) => T) => void]}
 **/
export function useState(initialState) {
  const cursor = hookCursor++;
  if (hooks.length <= cursor) {
    hooks[cursor] = initialState;
  }
  function setState(updater) {
    hooks[cursor] =
      typeof updater === "function" ? updater(hooks[cursor]) : updater;
    rerender();
  }
  return [hooks[cursor], setState];
}

export function useEffect() {
  todo();
}

function createElement(type, props = {}, ...children) {
  return {
    type,
    props,
    children: children.filter((child) => typeof child === "number" || !!child),
  };
}

export const React = { createElement };

/**
 * @param {Node} domNode
 * @param {Record<string, unknown>} oldProps
 * @param {Record<string, unknown>} newProps
 **/
function updateDomProperties(domNode, oldProps, newProps) {
  for (const key in oldProps) {
    if (key.startsWith("on")) {
      const event = key.slice(2).toLowerCase();
      domNode.removeEventListener(event, oldProps[key]);
    } else {
      domNode.removeAttribute(key);
    }
  }

  for (const key in newProps) {
    if (key.startsWith("on")) {
      const event = key.slice(2).toLowerCase();
      domNode.addEventListener(event, newProps[key]);
    } else {
      domNode.setAttribute(key, newProps[key]);
    }
  }
}

/**
 * @param {ReactElement | string | number | true} element
 * @returns {Fiber}
 **/
function createFiber(element) {
  if (typeof element !== "object") {
    const domNode = document.createTextNode(String(element));
    const childFibers = [];
    return {
      domNode,
      childFibers,
      element,
    };
  }

  const { type, props, children } = element;

  if (typeof type === "function") {
    const returnedElement = type(props);
    const returnedFiber = createFiber(returnedElement);

    return {
      domNode: returnedFiber.domNode,
      childFibers: returnedFiber.childFibers,
      returnedFiber,
      element,
    };
  }

  const domNode = document.createElement(type);
  updateDomProperties(domNode, {}, props);

  const childFibers = children.map(createFiber);
  childFibers.forEach((fiber) => {
    domNode.appendChild(fiber.domNode);
  });

  return {
    domNode,
    childFibers,
    element,
  };
}

/**
 * @param {Fiber} fiber
 * @param {ReactElement} element
 * @returns {Fiber[]}
 **/
function reconcileChildren(fiber, element) {
  const childFibers = [];

  const biggestLength = Math.max(
    fiber.childFibers.length,
    element.children.length,
  );

  for (let i = 0; i < biggestLength; i++) {
    const childFiber = fiber.childFibers[i];
    const childElement = element.children[i];

    const newChildFiber = reconcile(fiber.domNode, childFiber, childElement);
    if (newChildFiber) childFibers.push(newChildFiber);
  }

  return childFibers;
}

/**
 * @param {Node} parentDomNode
 * @param {Fiber | null} fiber
 * @param {ReactElement | string | number | true | null} element
 * @returns {Fiber | null}
 **/
function reconcile(parentDomNode, fiber, element) {
  if (!fiber) {
    // create a fiber for the element and add its node to the dom
    const newFiber = createFiber(element);
    parentDomNode.appendChild(newFiber.domNode);
    return newFiber;
  } else if (element === null || element === undefined) {
    // remove the existing node from the dom
    parentDomNode.removeChild(fiber.domNode);
    return null;
  } else if (element.type !== fiber.element.type) {
    // replace the existing node with a new one
    const newFiber = createFiber(element);
    parentDomNode.replaceChild(newFiber.domNode, fiber.domNode);
    return newFiber;
  } else {
    if (typeof element !== "object") {
      if (fiber.element !== element) {
        fiber.domNode.nodeValue = String(element);
        fiber.element = element;
      }
      return fiber;
    }

    if (typeof element.type === "function") {
      const returnedElement = element.type(element.props);
      const newFiber = reconcile(
        parentDomNode,
        fiber.returnedFiber,
        returnedElement,
      );
      fiber.returnedFiber = newFiber;
      fiber.childFibers = newFiber.childFibers;
      fiber.domNode = newFiber.domNode;
      fiber.element = element;
      return fiber;
    }

    // update the existing node in-place
    updateDomProperties(fiber.domNode, fiber.element.props, element.props);
    fiber.childFibers = reconcileChildren(fiber, element);
    fiber.element = element;
    return fiber;
  }
}

/**
 * @type {Fiber | null}
 **/
let rootFiber = null;

/**
 * @param {ReactElement} element
 * @param {Node} domNode
 **/
function render(element, domNode) {
  if (!rerender) {
    rerender = () => {
      hookCursor = 0;
      render(element, domNode);
    };
  }

  rootFiber = reconcile(domNode, rootFiber, element);
}

export const ReactDOM = { render };
