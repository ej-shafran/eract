new EventSource("/esbuild").addEventListener("change", () => location.reload());

function TODO() {
  throw new Error("Not yet implemented!");
}

function INVALID(data) {
  console.error(
    `Invalid state! Should not have gotten here :(\n\t%cDebug info: %c${data}`,
    "font-weight:bold;",
    "font-family:Menlo,monospace;font-size:12px;background-color:#222;padding:1px 4px;border-radius:3px"
  );
  throw new Error("INVALID");
}

const $$typeof = Symbol.for("eract.element");

const React = {
  createElement: (tag, props, ...children) => {
    return {
      tag,
      props: {
        ...props,
        children,
      },
      $$typeof,
    };
  },
  states: [],
  cursor: 0,
  useState: (initialState) => {
    const cursor = React.cursor++;
    React.states[cursor] = React.states[cursor] ?? initialState;
    const setState = (newState) => {
      React.states[cursor] = newState;
      rerender();
    };

    return [React.states[cursor], setState];
  },
};

const ReactDOM = {
  render: (element, eractElement) => {
    const instance = ReactDOM.instantiate(eractElement);
    element.appendChild(instance);
  },
  instantiate: (eractElement) => {
    const { tag, props } = eractElement;

    if (typeof tag === "string" || typeof tag === "number") {
      const element = document.createElement(String(tag));
      for (let prop in props) {
        if (prop === "children") continue;

        element[prop] = props[prop];
      }

      for (let child of props.children) {
        if (typeof child === "string" || typeof child === "number") {
          const text = document.createTextNode(String(child));
          element.appendChild(text);
        } else if (typeof child === "object" && child.$$typeof === $$typeof) {
          const instance = ReactDOM.instantiate(child);
          element.appendChild(instance);
        } else {
          INVALID(`typeof child: ${typeof child}`);
        }
      }

      return element;
    } else if (typeof tag === "function") {
      const returned = tag(props);
      return ReactDOM.instantiate(returned);
    } else {
      INVALID(`typeof tag: ${typeof tag}`);
    }
  },
};

const App = (props) => {
  const [count, setCount] = React.useState(0);
  const [name, setName] = React.useState("");

  return (
    <div>
      <h1>Hello, world!</h1>
      <img src="https://picsum.photos/200/300" alt="Random!" />
      <p>{props.text}</p>
      <button onclick={() => setCount(count + 1)}>Count: {count}</button>
      <input value={name} onchange={(e) => setName(e.target.value)}/>
      <p>Name is: {name}</p>
    </div>
  );
};

function rerender() {
  React.cursor = 0;
  document.getElementById("app").firstChild.remove();

  ReactDOM.render(
    document.getElementById("app"),
    <App text="Some other text!" />
  );
}

ReactDOM.render(
  document.getElementById("app"),
  <App text="Some other text!" />
);
