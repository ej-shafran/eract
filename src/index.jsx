import { render, useState, useEffect, useRef } from "./react";

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

function RandomImage() {
  const [clicks, setClicks] = useState(0);
  const seed = useRef(Math.floor(Math.random() * 100000));

  useEffect(() => {
    console.log("seed: ", seed.current);
  }, []);

  useEffect(() => {
    console.log("clicks on image: ", clicks);
  }, [clicks]);

  return (
    <img
      src={`https://picsum.photos/seed/${seed.current}/200/300`}
      alt="Random!"
      onClick={() => setClicks((prev) => prev + 1)}
    />
  );
}

const App = () => {
  const [name, setName] = useState("");

  return (
    <div>
      <Button text="Count" />
      <br />

      <Button text="Count Again" />
      <br />

      <RandomImage />

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
