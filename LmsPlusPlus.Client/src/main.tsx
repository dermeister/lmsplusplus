import React from "react"
import ReactDOM from "react-dom"
import { Transaction } from "reactronic"
import "xterm/css/xterm.css"
import { App } from "./ui/App"
import { autorender } from "./ui/autorender"
import "./ui/index.scss"

const app = Transaction.run(null, () => new App())

function Bootstrap(): JSX.Element {
    return autorender(() => app.render(), [app])
}

ReactDOM.render(<Bootstrap />, document.getElementById("root"))

window.onbeforeunload = () => {
    app.dispose()
    ReactDOM.unmountComponentAtNode(document.getElementById("root") as HTMLElement)
}
