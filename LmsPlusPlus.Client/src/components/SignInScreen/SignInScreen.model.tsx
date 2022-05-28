import React from "react"
import { cached, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { AuthError, IAuthService } from "../AuthService"
import { IErrorService } from "../ErrorService"
import { IScreen } from "../IScreen"
import * as view from "./SignInScreen.view"

export class SignInScreen extends ObservableObject implements IScreen {
    @unobservable private readonly _authService: IAuthService
    @unobservable private readonly _errorService: IErrorService
    private _login = ""
    private _password = ""

    get login(): string { return this._login }
    get password(): string { return this._password }

    constructor(authService: IAuthService, errorService: IErrorService) {
        super()
        this._authService = authService
        this._errorService = errorService
    }

    @transaction
    setLogin(login: string): void {
        this._login = login
    }

    @transaction
    setPassword(password: string): void {
        this._password = password
    }

    async signIn(): Promise<void> {
        try {
            await this._authService.signIn(this.login, this.password)
        } catch (e) {
            if (e instanceof AuthError)
                this._errorService.showError(e.axiosError)
        }
    }

    @cached
    render(): JSX.Element {
        return <view.SignInScreen screen={this} />
    }
}
