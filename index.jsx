// Hot Module Reloading
new EventSource("/esbuild").addEventListener("change", () => location.reload());

function TODO() {
  throw new Error("Not yet implemented!");
}

function INVALID(debug) {
  console.error(
    `Invalid state reached; should not have gotten here! :(\n\t%c Debug Info: %c ${debug}`,
    "font-weight:bold;",
    "font-family:monospace;background-color:#222;padding:1px 4px;border-radius:3px;"
  );

  throw new Error("INVALID");
}

const TEXT = "TEXT";
const $$typeof = Symbol.for("eract.domNode");

const React = {
  createElement: (type, props, ...children) => {
    props = Object.assign({}, props);
    props.children = children
      .filter(
        (child) => child !== null && child !== undefined && child !== false
      )
      .map((child) => {
        if (typeof child === "object" && child.$$typeof === $$typeof) {
          return child;
        } else if (typeof child === "string" || typeof child === "number") {
          return React.createElement(TEXT, { nodeValue: "" + child });
        }
      });

    return {
      type,
      props,
      $$typeof,
    };
  },
};

let rootInstance = null;
let rerender = null;
const hooks = [];
let cleanups = [];
let hookCursor = 0;

function render(eractEl, domNode) {
  if (!rerender) {
    rerender = function() {
      hookCursor = 0;
      render(eractEl, domNode);
    };
  }

  cleanups.forEach((cb) => cb());
  cleanups = [];

  const prev = rootInstance;
  const next = reconcile(domNode, prev, eractEl);
  rootInstance = next;
}

function reconcile(domNode, instance, eractEl) {
  if (instance === null) {
    if (eractEl === null) INVALID("Cannot reconcile `null` with `null`");
    const newInstance = instantiate(eractEl);
    domNode.appendChild(newInstance.domNode);
    return newInstance;
  } else if (eractEl === null) {
    domNode.removeChild(instance.domNode);
    return null;
  } else if (instance.eractEl.type !== eractEl.type) {
    const newInstance = instantiate(eractEl);
    domNode.replaceChild(newInstance.domNode, instance.domNode);
    return newInstance;
  } else if (typeof eractEl.type === "string") {
    updateDOMProps(instance.domNode, instance.eractEl.props, eractEl.props);
    instance.childInstances = reconcileChildren(instance, eractEl);
    instance.eractEl = eractEl;
    return instance;
  } else {
    const childEractEl = eractEl.type(eractEl.props);
    reconcile(domNode, instance.__internalInstance, childEractEl);
    instance.eractEl = eractEl;
    return instance;
  }
}

function instantiate(eractEl) {
  const { type, props } = eractEl;

  if (typeof type !== "string") {
    const returned = type(props);
    const instance = instantiate(returned);

    return {
      domNode: instance.domNode,
      childInstances: instance.childInstances,
      eractEl,
      __internalInstance: instance,
    };
  }

  const isTextElement = type === TEXT;

  const domNode = isTextElement
    ? document.createTextNode(eractEl.props.nodeValue)
    : document.createElement(type);

  updateDOMProps(domNode, {}, props);

  const { children } = props;

  const childInstances = children.map(instantiate);

  childInstances.forEach((instance) => {
    domNode.appendChild(instance.domNode);
  });

  return {
    domNode,
    eractEl,
    childInstances,
  };
}

function updateDOMProps(domNode, prevProps, nextProps) {
  const prevKeys = Object.keys(prevProps).filter(
    (key) => prevProps[key] !== nextProps[key]
  );

  prevKeys.filter(isEventProp).forEach((value) => {
    domNode.removeEventListener(
      value.substring(2).toLowerCase(),
      prevProps[value]
    );
  });

  prevKeys.filter(isAttributeProp).forEach((value) => {
    domNode[value] = null;
  });

  const nextKeys = Object.keys(nextProps).filter(
    (key) => prevProps[key] !== nextProps[key]
  );

  nextKeys.filter(isEventProp).forEach((value) => {
    domNode.addEventListener(
      value.substring(2).toLowerCase(),
      nextProps[value]
    );
  });

  nextKeys.filter(isAttributeProp).forEach((value) => {
    domNode[value] = nextProps[value];
  });
}

function isEventProp(prop) {
  return prop.startsWith("on");
}

function isAttributeProp(propName) {
  return propName !== "children" && !propName.startsWith("on");
}

function reconcileChildren(instance, eractEl) {
  const newChildInstances = [];

  const count = Math.max(
    instance.childInstances.length,
    eractEl.props.children.length
  );

  for (let i = 0; i < count; i++) {
    const childInstance = instance.childInstances[i];
    const childElement = eractEl.props.children[i];
    const newInstance = reconcile(
      instance.domNode,
      childInstance ?? null,
      childElement ?? null
    );
    newChildInstances.push(newInstance);
  }

  return newChildInstances.filter(Boolean);
}

function useState(initialState) {
  const cursor = hookCursor++;

  hooks[cursor] =
    hooks[cursor] ??
    (typeof initialState === "function" ? initialState() : initialState);

  const setState = (newState) => {
    hooks[cursor] =
      typeof newState === "function" ? newState(hooks[cursor]) : newState;
    if (rerender) rerender();
  };

  return [hooks[cursor], setState];
}

function useEffect(cb, deps) {
  const cursor = hookCursor++;

  let hasChanged = true;

  if (deps) {
    hasChanged = deps.some((dep, i) => !Object.is(hooks[cursor]?.[i], dep));
  }

  hooks[cursor] = deps;

  if (hasChanged) {
    const cleanup = cb();
    if (cleanup) cleanups.push(cleanup);
  }
}

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
