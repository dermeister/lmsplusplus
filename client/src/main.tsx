import React from "react";
import ReactDOM from "react-dom";
import { Transaction } from "reactronic";

import { Root } from "./components/Root";
import { RootModel } from "./models/RootModel";
import "./index.css";

const model = Transaction.run(() => new RootModel());

ReactDOM.render(<Root model={model} />, document.getElementById("root"));
