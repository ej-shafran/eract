import { todo } from "./common/utils";

function createElement(type, props = {}, ...children) {
  return {
    type,
    props,
    children
  }
}

const React = { createElement };

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
    todo();
    return;
  }

  const domNode = document.createElement(type);

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

const element = (<div>Hello, world!</div>);
const domNode = document.getElementById("root");
ReactDOM.render(element, domNode);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
