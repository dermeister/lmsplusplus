import React from "react"
import { reaction, Transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import { ObservableObject } from "../../ObservableObject"
import { AuthService } from "../AuthService"
import { EmptyScreen } from "../EmptyScreen"
import { IComponent } from "../IComponent"
import { IScreen } from "../IScreen"
import { SignInScreenModel } from "../SignInScreen/SignInScreen.model"
import { WorkbenchScreen } from "../WorkbenchScreen"
import { AppView } from "./App.view"

export class AppModel extends ObservableObject implements IComponent {
    @unobservable private _context: DatabaseContext | null = null
    @unobservable private readonly _authService: AuthService
    private _currentScreen: IScreen = new EmptyScreen()

    get currentScreen(): IScreen { return this._currentScreen }

    constructor() {
        super()
        this._authService = new AuthService("app-token")
    }

    render(): JSX.Element {
        return <AppView model={this} />
    }

    override dispose(): void {
        Transaction.run(() => {
            this._currentScreen.dispose()
            this._context?.dispose()
            super.dispose()
        })
    }

    @reaction
    private updateCurrentScreen(): void {
        this._currentScreen.dispose()
        if (this._authService.jwtToken) {
            this._context = new DatabaseContext()
            this._currentScreen = new WorkbenchScreen(this._context, this._authService)
        } else
            this._currentScreen = new SignInScreenModel(this._authService)
    }
}
