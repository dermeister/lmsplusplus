import React from "react"
import { cached } from "reactronic"
import { IScreen } from "../IScreen"
import * as view from "./EmptyScreen.view"

export class EmptyScreen implements IScreen {
    dispose(): void { }

    @cached
    render(): JSX.Element {
        return <view.EmptyScreen />
    }
}
