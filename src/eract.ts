import { INVALID, NEVER, TODO } from "./common/utils";

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
export function render(eractEl: EractElement, domNode: HTMLElement) {
  const prev = rootInstance;
  const next = reconcile(domNode, prev, eractEl);
  rootInstance = next;
}

function reconcile(
  domNode: HTMLElement,
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
  } else if (typeof eractEl.type === "string") {
    // update the instance and reconcile the children

    updateDomProps(instance.domNode, eractEl.props);
    const newChildInstances = reconcileChildren(instance, eractEl);
    instance.eractEl = eractEl;
    instance.childInstances = newChildInstances;
    return instance;
  } else if (typeof eractEl.type === "function") {
    TODO();
  } else {
    TODO();
  }
}
function instantiate(eractEl: EractElement): EractInstance {
  const { type, props } = eractEl;

  if (typeof type === "function") {
    TODO();
  }

  if (typeof type === "symbol") {
    if (type === $$fragment) {
      TODO();
    } else if (type === $$text) {
      const domNode = document.createTextNode(props.nodeValue);

      return {
        domNode,
        childInstances: [],
        eractEl,
      };
    } else {
      INVALID();
    }
  }

  const domNode = document.createElement(type);

  updateDomProps(domNode, props);

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

function updateDomProps(domNode: Node, props: GenericProps) {
  const keys = Object.keys(props);

  keys.forEach((key) => {
    if (key === "children") {
      return;
    } else if (key.startsWith("on")) {
      const event = key.slice(2).toLowerCase();
      domNode.addEventListener(event, props[key]);
    } else if (
      Object.keys(HTMLElement.prototype).includes(key) &&
      !invalidDomProps.includes(key as InvalidDomProp)
    ) {
      domNode[key as Exclude<keyof Node, InvalidDomProp>] = props[key];
    } else {
      TODO();
    }
  });
}

function reconcileChildren(
  instance: EractInstance,
  eractEl: EractElement<any>
): EractInstance[] {
  TODO();
}
