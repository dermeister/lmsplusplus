import React from "react";
import ReactDOM from "react-dom";
import { Transaction } from "reactronic";

import { App } from "./components/App";
import { AppModel } from "./models/AppModel";
import "./index.css";

const model = Transaction.run(() => new AppModel());

ReactDOM.render(<App model={model} />, document.getElementById("root"));
