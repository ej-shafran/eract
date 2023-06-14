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

const $$typeof = Symbol.for("eract.element");

const React = {
  createElement: (type, props, ...children) => {
    props.children = children.filter(Boolean).map((child) => {
      if (typeof child === "object" && child.$$typeof === $$typeof) {
        return child;
      }
    });
    console.log("args: ", args);
  },
};

console.log(<div>Hello, world!</div>);
