import React from "react"
import ReactDOM from "react-dom"
import { Transaction } from "reactronic"
import "xterm/css/xterm.css"
import { Workbench } from "./components/Workbench"
import "./components/index.scss"
import * as models from "./models"
import { DatabaseContext } from "./database"

const app = Transaction.run(() => new Workbench(new DatabaseContext()))
ReactDOM.render(app.render(), document.getElementById("root"))

// const model = Transaction.run(() => new models.App())

// ReactDOM.render(<App model={model} />, document.getElementById("root"))

// window.onbeforeunload = () => {
//     model.dispose()
//     ReactDOM.unmountComponentAtNode(document.getElementById("root") as HTMLElement)
// }

