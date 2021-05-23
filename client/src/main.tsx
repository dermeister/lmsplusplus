import React from "react";
import ReactDOM from "react-dom";
import { Transaction } from "reactronic";

import { App, AppModel } from "./components/App";

const model = Transaction.run(() => new AppModel());

ReactDOM.render(
  <React.StrictMode>
    <App model={model} />
  </React.StrictMode>,
  document.getElementById("root")
);
