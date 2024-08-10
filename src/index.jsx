import { todo } from "./common/utils";

function createElement(type, props = {}, ...children) {
  return {
    type,
    props,
    children
  }
}

const React = { createElement };

function render(element, domNode) {
  todo();
}

const ReactDOM = { render };

const element = (<div>Hello, world!</div>);
const domNode = document.getElementById("root");
ReactDOM.render(element, domNode);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
