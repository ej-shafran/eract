import React, { render, useState } from "./react";

/**
 * App.
 *
 * @param {{ text: string }} props
 */
function App(props) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span>{props.text}</span>
      <h1>Hello, world!</h1>

      <br />
      <br />
      <br />

      <button
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      >
        Count: {count}
      </button>
    </div>
  );
}

render(<App text="Wow!" />, document.getElementById("root"));

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
