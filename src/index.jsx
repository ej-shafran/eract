import { React, ReactDOM, useState, useEffect } from "./react";

function App() {
  const [count, setCount] = useState(0);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    console.log("count = ", count);
  }, [count]);

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

        {fullName ? <b>I know your name!</b> : <p>I don't know your name...</p>}
        {!!fullName && <p>Your name is: {fullName}</p>}
      </div>
    </div>
  );
}

const element = <App />;
const domNode = document.getElementById("root");
ReactDOM.render(element, domNode);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
