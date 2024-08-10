import { todo } from "./common/utils";

function useState(initialState) {
  let state = initialState;
  function setState(updater) {
    state = typeof updater === "function" ? updater(state) : updater;
    console.log("state = ", state);
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

function updateDomProperties(domNode, newProps) {
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
      element,
    }
  }

  const domNode = document.createElement(type);
  updateDomProperties(domNode, props);

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
function render(element, domNode) {
  const fiber = createFiber(element);
  domNode.appendChild(fiber.domNode);
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
