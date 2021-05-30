import React from "react";
import ReactDOM from "react-dom";
import { Transaction } from "reactronic";
import { Root } from "./components/Root";
import "./index.css";
import { Models } from "./models";

const model = Transaction.run(() => new Models.Root());

ReactDOM.render(<Root model={model} />, document.getElementById("root"));
