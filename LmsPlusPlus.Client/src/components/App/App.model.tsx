import axios from "axios"
import React from "react"
import { cached, nonreactive, reaction, Transaction, isnonreactive } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { AuthService } from "../AuthService"
import { EmptyScreen } from "../EmptyScreen"
import { ErrorService } from "../ErrorService"
import { IScreen } from "../IScreen"
import { SignInScreen } from "../SignInScreen/SignInScreen.model"
import { WorkbenchScreen } from "../WorkbenchScreen"
import * as view from "./App.view"

export class App extends ObservableObject {
    @isnonreactive private readonly _authService: AuthService
    @isnonreactive private readonly _errorService = new ErrorService()
    private _currentScreen: IScreen = new EmptyScreen()

    constructor() {
        super()
        const unauthorizedApi = axios.create()
        this._authService = new AuthService(unauthorizedApi, "app-token")
    }

    @cached
    render(): JSX.Element {
        return <view.App currentScreen={this._currentScreen} />
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this._currentScreen.dispose()
            super.dispose()
        })
    }

    @reaction
    private updateCurrentScreen(): void {
        nonreactive(() => this._currentScreen.dispose())
        if (this._authService.jwtToken) {
            const api = axios.create({ headers: { Authorization: `Bearer ${this._authService.jwtToken}` } })
            this._currentScreen = nonreactive(() => new WorkbenchScreen(api, this._authService, this._errorService))
        } else
            this._currentScreen = nonreactive(() => new SignInScreen(this._authService, this._errorService))
    }
}
