export const TEXT = "TEXT";
export const ELEMENT_SYMBOL = Symbol.for("eract.element");

export function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const children = args.length > 0 ? args : [];
  props.children = children
    .filter(Boolean)
    .map((child) =>
      typeof child === "object"
        ? child
        : createElement(TEXT, { value: "" + child })
    );

  return {
    type,
    props,
    $$typeof: ELEMENT_SYMBOL,
  };
}
