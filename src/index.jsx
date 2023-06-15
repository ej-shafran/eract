import React, { render, useEffect, useState } from "./react";

/**
 * App.
 *
 * @param {{ text: string }} props
 */
function App(props) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    console.log("mounted");

    return () => {
      console.log("unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("count increased: ", count);
  }, [count]);

  return (
    <div>
      {count < 5 && <span>{props.text}</span>}
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

      <br />
      <br />
      <br />

      <h2>Name is: {name}</h2>
      <input value={name} onInput={(e) => setName(e.target.value)} />
    </div>
  );
}

render(<App text="Wow!" />, document.getElementById("root"));

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
