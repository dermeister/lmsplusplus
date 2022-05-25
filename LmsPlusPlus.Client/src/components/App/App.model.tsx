import React from "react"
import { cached, nonreactive, reaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { AuthService } from "../AuthService"
import { EmptyScreen } from "../EmptyScreen"
import { IScreen } from "../IScreen"
import { SignInScreen } from "../SignInScreen/SignInScreen.model"
import { WorkbenchScreen } from "../WorkbenchScreen"
import * as view from "./App.view"

export class App extends ObservableObject {
    @unobservable private readonly _authService: AuthService
    private _currentScreen: IScreen = new EmptyScreen()

    constructor() {
        super()
        this._authService = new AuthService("app-token")
    }

    @cached
    render(): JSX.Element {
        return <view.App currentScreen={this._currentScreen} />
    }

    override dispose(): void {
        Transaction.run(() => {
            this._currentScreen.dispose()
            super.dispose()
        })
    }

    @reaction
    private updateCurrentScreen(): void {
        nonreactive(() => this._currentScreen.dispose())
        if (this._authService.jwtToken)
            this._currentScreen = new WorkbenchScreen(this._authService)
        else
            this._currentScreen = new SignInScreen(this._authService)
    }
}
