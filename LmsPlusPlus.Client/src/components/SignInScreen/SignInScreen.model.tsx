import React from "react"
import { cached, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { IAuthService } from "../AuthService"
import { IScreen } from "../IScreen"
import * as view from "./SignInScreen.view"

export class SignInScreen extends ObservableObject implements IScreen {
    @unobservable private readonly _authService: IAuthService
    private _login = ""
    private _password = ""

    get login(): string { return this._login }
    get password(): string { return this._password }

    constructor(authService: IAuthService) {
        super()
        this._authService = authService
    }

    @transaction
    setLogin(login: string): void {
        this._login = login
    }

    @transaction
    setPassword(password: string): void {
        this._password = password
    }

    @transaction
    async signIn(): Promise<void> {
        const success = await this._authService.signIn(this.login, this.password)
        if (!success) {
            // TODO: handle
        }
    }

    @cached
    render(): JSX.Element {
        return <view.SignInScreen screen={this} />
    }
}
