import Eract, { render, useState } from "./eract";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount((prev) => prev + 1)}>
        Clicks: {count}
      </button>
      <ul>
        {[1, 2, 3, 4].map((value) => {
          return <li>Item {value}</li>;
        })}
      </ul>
    </>
  );
}

render(<App />, document.getElementById("root")!);

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./common/hmr";
