import React from "react"
import { autorender } from "./autorender"
import { WindowManager } from "./WindowManager"
import * as models from "../models"
import { SignInScreen } from "./SignInScreen"
import { MainScreen } from "./MainScreen"

interface AppProps {
    model: models.App
}

export function App({ model }: AppProps): JSX.Element {
    return autorender(() => (
        <WindowManager model={model.windowManager}>
            {screen(model.screen)}
        </WindowManager>
    ))
}

function screen(screen: models.Screen): JSX.Element | undefined {
    if (screen instanceof models.MainScreen)
        return <MainScreen model={screen} />
    if (screen instanceof models.SignInScreen)
        return <SignInScreen model={screen} />
}
