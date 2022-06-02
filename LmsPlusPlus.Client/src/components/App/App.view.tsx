import React from "react"
import { autorender } from "../autorender"
import * as model from "./App.model"
import styles from "./App.module.scss"

interface AppProps {
    app: model.App
}

export function App({ app }: AppProps): JSX.Element {
    return autorender(() => (
        <div className={styles.app}>{app.currentScreen.render()}</div>
    ), [app])
}
