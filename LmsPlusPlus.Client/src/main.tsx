import ReactDOM from "react-dom"
import { Transaction } from "reactronic"
import "xterm/css/xterm.css"
import { App } from "./components/App"
import "./components/index.scss"

const app = Transaction.run(() => new App())
ReactDOM.render(app.render(), document.getElementById("root"))

window.onbeforeunload = () => {
    app.dispose()
    ReactDOM.unmountComponentAtNode(document.getElementById("root") as HTMLElement)
}

