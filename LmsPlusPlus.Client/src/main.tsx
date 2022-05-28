import React from "react"
import ReactDOM from "react-dom"
import { Transaction } from "reactronic"
import "xterm/css/xterm.css"
import { App } from "./components/App"
import { autorender } from "./components/autorender"
import "./components/index.scss"

const app = Transaction.run(null, () => new App())

function Root(): JSX.Element {
    return autorender(() => app.render(), [app])
}

ReactDOM.render(<Root />, document.getElementById("root"))

window.onbeforeunload = () => {
    app.dispose()
    ReactDOM.unmountComponentAtNode(document.getElementById("root") as HTMLElement)
}

