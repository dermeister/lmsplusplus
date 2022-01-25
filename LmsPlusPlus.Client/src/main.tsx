import React from "react"
import ReactDOM from "react-dom"
import { Transaction } from "reactronic"
import "xterm/css/xterm.css"
import { App } from "./components/App"
import "./components/index.scss"
import * as models from "./models"

const model = Transaction.run(() => new models.App())

ReactDOM.render(<App model={model} />, document.getElementById("root"))

window.onbeforeunload = () => {
    ReactDOM.unmountComponentAtNode(document.getElementById("root") as HTMLElement)
    model.dispose()
}

