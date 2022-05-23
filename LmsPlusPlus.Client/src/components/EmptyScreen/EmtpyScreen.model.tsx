import React from "react"
import { IScreen } from "../IScreen"
import { EmptyScreenView } from "./EmptyScreen.view"

export class EmptyScreenModel implements IScreen {
    dispose(): void { }

    render(): JSX.Element {
        return <EmptyScreenView />
    }
}
