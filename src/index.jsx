import { todo } from "./common/utils";

let rerender = null;

let stateCursor = 0;
const states = [];

function useState(initialState) {
  const cursor = stateCursor++;
  if (states.length <= cursor) {
    states[cursor] = initialState;
  }
  function setState(updater) {
    states[cursor] = typeof updater === "function" ? updater(states[cursor]) : updater;
    rerender();
  }
  return [states[cursor], setState];
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
      if (fiber.element !== element) {
        fiber.domNode.nodeValue = String(element);
        fiber.element = element;
      }
      return fiber;
    }

    if (typeof element.type === "function") {
      const returnedElement = element.type(element.props);
      const newFiber = reconcile(parentDomNode, fiber.returnedFiber, returnedElement);
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
  const [fullName, setFullName] = useState("");

  return (
    <div>
      <div>
        <div>Count is: {count}</div>
        <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>

      <div>
        <div>
          <label>Enter your full name:</label>
          <input onInput={(e) => setFullName(e.target.value)} />
        </div>

        <p>Your name is: {fullName}</p>
      </div>
    </div>
  );
}

const element = <App />;
const domNode = document.getElementById("root");
ReactDOM.render(element, domNode);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
