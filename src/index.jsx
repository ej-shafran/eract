import { todo } from "./common/utils";

function createElement() {
  todo();
}

const React = { createElement };

console.log(<div>Hello, world!</div>);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
