import { INVALID, NEVER } from "./common/utils";

type GenericProps = Record<string, any> &
  Partial<Record<"children", EractElement[]>>;

type EractElement<TProps extends GenericProps = GenericProps> = {
  type: string | ((props: TProps) => EractElement) | symbol;
  props: TProps;
  readonly $$typeof: typeof $$typeof;
};

type EractInstance = {
  domNode: Node;
  eractEl: EractElement;
  childInstances: EractInstance[];
  __previousReturn?: EractInstance;
};

type HTMLElementTagName = keyof HTMLElementTagNameMap;

type EractNode =
  | EractElement
  | string
  | number
  | null
  | undefined
  | boolean
  | EractNode[];

const $$typeof = Symbol.for("eract.element");
const $$text = Symbol.for("eract.textNode");
const $$fragment = Symbol.for("eract.fragment");

function isEractElement(arg: unknown): arg is EractElement {
  return (
    !!arg &&
    typeof arg === "object" &&
    "$$typeof" in arg &&
    arg.$$typeof === $$typeof
  );
}

function isRenderableChild(
  child: EractNode
): child is Exclude<EractNode, boolean | null | undefined> {
  return child !== null && child !== undefined && typeof child !== "boolean";
}

function handleChild(
  child: Exclude<EractNode, boolean | null | undefined>
): EractElement<any>[] {
  if (typeof child === "string" || typeof child === "number") {
    return [Eract.createElement($$text, { nodeValue: String(child) })];
  } else if (isEractElement(child)) {
    return [child];
  } else if (Array.isArray(child)) {
    return child.filter(isRenderableChild).flatMap(handleChild);
  } else {
    NEVER(child);
  }
}

const Eract = {
  Fragment: $$fragment,
  createElement<TProps extends GenericProps>(
    type: HTMLElementTagName | ((props: TProps) => EractElement) | symbol,
    props: TProps | null,
    ...children: EractNode[]
  ): EractElement<TProps> {
    props ??= {} as TProps;
    props.children = children.filter(isRenderableChild).flatMap(handleChild);

    return {
      type,
      props,
      $$typeof,
    };
  },
};

export default Eract;

let rootInstance: EractInstance | null = null;
let rerender: (() => void) | null = null;
const hooks = [] as unknown[];
let hookCursor = 0;
export function render(eractEl: EractElement, domNode: HTMLElement) {
  if (rerender === null) {
    rerender = () => {
      hookCursor = 0;
      render(eractEl, domNode);
    };
  }

  const prev = rootInstance;
  const next = reconcile(domNode, prev, eractEl);
  rootInstance = next;
}

function reconcile(
  domNode: Node,
  instance: EractInstance | null,
  eractEl: EractElement | null
): EractInstance | null {
  if (instance === null) {
    // create the instance
    if (eractEl === null) INVALID("Cannot reconcile `null` with `null`");

    const newInstance = instantiate(eractEl);
    domNode.appendChild(newInstance.domNode);
    return newInstance;
  } else if (eractEl === null) {
    // remove the instance

    domNode.removeChild(instance.domNode);
    return null;
  } else if (eractEl.type !== instance.eractEl.type) {
    // replace the instance

    const newInstance = instantiate(eractEl);
    domNode.replaceChild(newInstance.domNode, instance.domNode);
    return newInstance;
  } else if (
    typeof eractEl.type === "string" ||
    eractEl.type === $$text ||
    eractEl.type === $$fragment
  ) {
    // update the instance and reconcile the children

    updateDomProps(instance.domNode, instance.eractEl.props, eractEl.props);
    const newChildInstances = reconcileChildren(instance, eractEl);
    instance.eractEl = eractEl;
    instance.childInstances = newChildInstances;
    return instance;
  } else if (typeof eractEl.type === "function") {
    const returned = eractEl.type(eractEl.props);
    reconcile(domNode, instance.__previousReturn ?? null, returned);
    instance.eractEl = eractEl;
    return instance;
  } else {
    console.log("eractEl: ", eractEl);
    INVALID("invalid eractEl type");
  }
}
function instantiate(eractEl: EractElement): EractInstance {
  const { type, props } = eractEl;

  if (typeof type === "function") {
    const returned = type(props);
    const returnedInstance = instantiate(returned);

    return {
      eractEl,
      domNode: returnedInstance.domNode,
      childInstances: returnedInstance.childInstances,
      __previousReturn: returnedInstance,
    };
  }

  if (type === $$text) {
    const domNode = document.createTextNode(props.nodeValue);

    return {
      domNode,
      childInstances: [],
      eractEl,
    };
  }

  if (typeof type === "symbol" && type !== $$fragment) INVALID();

  const domNode =
    typeof type === "symbol"
      ? document.createDocumentFragment()
      : document.createElement(type);

  updateDomProps(domNode, {}, props);

  const { children = [] } = props;

  const childInstances = children.map(instantiate);
  childInstances.forEach((child) => {
    domNode.appendChild(child.domNode);
  });

  return {
    domNode,
    eractEl,
    childInstances,
  };
}

const invalidDomProps = [
  "ATTRIBUTE_NODE",
  "CDATA_SECTION_NODE",
  "COMMENT_NODE",
  "DOCUMENT_FRAGMENT_NODE",
  "DOCUMENT_NODE",
  "DOCUMENT_POSITION_CONTAINED_BY",
  "DOCUMENT_POSITION_CONTAINS",
  "DOCUMENT_POSITION_DISCONNECTED",
  "DOCUMENT_POSITION_FOLLOWING",
  "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",
  "DOCUMENT_POSITION_PRECEDING",
  "DOCUMENT_TYPE_NODE",
  "ELEMENT_NODE",
  "ENTITY_NODE",
  "ENTITY_REFERENCE_NODE",
  "NOTATION_NODE",
  "PROCESSING_INSTRUCTION_NODE",
  "TEXT_NODE",
  "baseURI",
  "childNodes",
  "firstChild",
  "isConnected",
  "lastChild",
  "nextSibling",
  "nodeName",
  "nodeType",
  "ownerDocument",
  "parentElement",
  "parentNode",
  "previousSibling",
] as const;
type InvalidDomProp = (typeof invalidDomProps)[number];

function updateDomProps(
  domNode: Node,
  prevProps: GenericProps,
  nextProps: GenericProps
) {
  const prevKeys = Object.keys(prevProps).filter(
    (key) => prevProps[key] !== nextProps[key]
  );

  prevKeys.forEach((key) => {
    if (key === "children") {
      return;
    } else if (key.startsWith("on")) {
      const event = key.slice(2).toLowerCase();
      domNode.removeEventListener(event, prevProps[key]);
    } else if (!invalidDomProps.includes(key as InvalidDomProp)) {
      domNode[key as Exclude<keyof Node, InvalidDomProp>] = null as any;
    } else {
      INVALID("invalid DOM property");
    }
  });

  const nextKeys = Object.keys(nextProps).filter(
    (key) => prevProps[key] !== nextProps[key]
  );

  nextKeys.forEach((key) => {
    if (key === "children") {
      return;
    } else if (key.startsWith("on")) {
      const event = key.slice(2).toLowerCase();
      domNode.addEventListener(event, nextProps[key]);
    } else if (!invalidDomProps.includes(key as InvalidDomProp)) {
      domNode[key as Exclude<keyof Node, InvalidDomProp>] = nextProps[key];
    } else {
      INVALID("invalid DOM property");
    }
  });
}

function reconcileChildren(
  instance: EractInstance,
  eractEl: EractElement<any>
): EractInstance[] {
  const { props } = eractEl;
  const newChildInstances = [] as EractInstance[];

  const childCount = Math.max(
    props.children.length,
    instance.childInstances.length
  );

  for (let i = 0; i < childCount; i++) {
    const instanceChild = instance.childInstances[i] ?? null;
    const eractElChild = props.children[i] ?? null;

    const newInstance = reconcile(
      instance.domNode,
      instanceChild,
      eractElChild
    );

    if (newInstance) newChildInstances.push(newInstance);
  }

  return newChildInstances;
}

type SetState<T> = (updater: ((prev: T) => T) | T) => void;

export function useState<T>(initialState: T) {
  const cursor = hookCursor++;

  hooks[cursor] ??= initialState;

  const setState: SetState<T> = (updater) => {
    hooks[cursor] =
      updater instanceof Function ? updater(hooks[cursor] as T) : updater;
    if (!rerender) INVALID();
    rerender();
  };

  return [hooks[cursor] as T, setState] as const;
}
