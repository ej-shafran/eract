import { reconcile } from "./dom-utils";

export class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState);
    updateInstance(this.__internalInstance);
  }
}

function updateInstance(internalInstance) {
  const parentNode = internalInstance.domNode.parentNode;
  const el = internalInstance.el;
  reconcile(parentNode, internalInstance, el);
}
