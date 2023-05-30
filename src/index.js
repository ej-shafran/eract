import { Component } from "./component";
import { createElement } from "./createElement";
import { render } from "./dom-utils";

class App extends Component {
  state = {
    count: 0,
  };

  render() {
    return createElement(
      "div",
      {},
      this.props.text,
      createElement("br", {}),
      this.state.count < 10
        ? createElement(
          "button",
          {
            onClick: () => this.setState({ count: this.state.count + 1 }),
          },
          "Click me!"
        )
        : null,
      createElement("div", {}, "" + this.state.count)
    );
  }
}

const root = document.getElementById("root");

const el = createElement(App, { text: "hello!" });

render(el, root);

new EventSource("/esbuild").addEventListener("change", () => location.reload());
