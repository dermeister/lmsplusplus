import React from "react"
import ReactDOM from "react-dom"
import { Transaction } from "reactronic"
import "xterm/css/xterm.css"
import { Root } from "./components/Root"
import "./index.css"
import * as models from "./models"

const model = Transaction.run(() => new models.Root())

ReactDOM.render(<Root model={model} />, document.getElementById("root"))
