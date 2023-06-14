import { render, useState, useEffect } from "./react";

const Button = (props) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("count changed: ", count);

    return () => {
      console.log("cleanup!");
    };
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount((prev) => prev + 1)}>
        {props.text}: {count}
      </button>

      <div>{count >= 10 && <span>The count is high!</span>}</div>
    </div>
  );
};

const App = () => {
  const [name, setName] = useState("");

  return (
    <div>
      <Button text="Count" />
      <br />

      <Button text="Count Again" />
      <br />

      <img alt="Random!" src="https://picsum.photos/200/300" />

      <br />
      <br />

      <input value={name} onInput={(e) => setName(e.target.value)} />
      <p>Your name is: {name}</p>
    </div>
  );
};

render(<App />, document.getElementById("root"));

// HOT MODULE RELOADING - makes sure the page refreshes when changes are made
import "./hmr";
