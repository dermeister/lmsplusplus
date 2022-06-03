import axios from "axios"
import React from "react"
import { cached, isnonreactive, nonreactive, reaction, Transaction } from "reactronic"
import { AuthService } from "../../api"
import { ObservableObject } from "../../ObservableObject"
import { EmptyScreen } from "../EmptyScreen"
import { IScreen } from "../IScreen"
import { MessageService } from "../MessageService"
import { SignInScreen } from "../SignInScreen/SignInScreen.model"
import { WorkbenchScreen } from "../WorkbenchScreen"
import * as view from "./App.view"

export class App extends ObservableObject {
    @isnonreactive private readonly _authService = new AuthService(axios.create(), "app-token")
    @isnonreactive private readonly _messageService = new MessageService()
    private _currentScreen: IScreen = new EmptyScreen()

    get currentScreen(): IScreen { return this._currentScreen }

    @cached
    render(): JSX.Element {
        return <view.App app={this} />
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
            this._currentScreen = nonreactive(() => new WorkbenchScreen(api, this._authService, this._messageService))
        } else
            this._currentScreen = nonreactive(() => new SignInScreen(this._authService, this._messageService))
    }
}
