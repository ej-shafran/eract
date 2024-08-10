import { todo } from "./common/utils";

let rerender = null;

function useState(initialState) {
  let state = initialState;
  function setState(updater) {
    state = typeof updater === "function" ? updater(state) : updater;
    rerender();
  }
  return [state, setState];
}

function createElement(type, props = {}, ...children) {
  return {
    type,
    props,
    children
  }
}

const React = { createElement };

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

function createFiber(element) {
  if (typeof element !== "object") {
    const domNode = document.createTextNode(String(element));
    const childFibers = [];
    return {
      domNode,
      childFibers,
      element,
    }
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
    }
  }

  const domNode = document.createElement(type);
  updateDomProperties(domNode, {}, props);

  const childFibers = children.map(createFiber);
  childFibers.forEach(fiber => {
    domNode.appendChild(fiber.domNode);
  });

  return {
    domNode,
    childFibers,
    element,
  }
}
function reconcile(parentDomNode, fiber, element) {
  if (!fiber) {
    // create a fiber for the element and add its node to the dom
    const newFiber = createFiber(element);
    parentDomNode.appendChild(newFiber.domNode);
    return newFiber;
  } else if (element === null || element === undefined) {
    // remove the existing node from the dom
    todo();
  } else if (element.type !== fiber.element.type) {
    // replace the existing node with a new one
    todo();
  } else {
    if (typeof element !== "object") {
      todo();
      return;
    }

    if (typeof element.type === "function") {
      todo();
      return;
    }

    // update the existing node in-place
    updateDomProperties(fiber.domNode, fiber.element.props, element.props);
    todo();
  }
}

let rootFiber = null;

function render(element, domNode) {
  if (!rerender) {
    rerender = () => {
      render(element, domNode);
    }
  }

  rootFiber = reconcile(domNode, rootFiber, element);
}

const ReactDOM = { render };

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <div>Count is: {count}</div>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

const element = <App />;
const domNode = document.getElementById("root");
ReactDOM.render(element, domNode);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
