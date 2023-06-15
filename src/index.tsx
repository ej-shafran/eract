import Eract, { render } from "./eract";

render(
  <div>
    <h1 style="color:blue;">Hello, world!</h1>
    <ul>
      {[1, 2, 3, 4].map((value) => {
        return <li>Item {value}</li>;
      })}
    </ul>
  </div>,
  document.getElementById("root")!
);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
