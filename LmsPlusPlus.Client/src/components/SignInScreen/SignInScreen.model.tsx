import React from "react"
import { cached, isnonreactive, options, Reentrance, Transaction, transaction } from "reactronic"
import { AppError } from "../../AppError"
import { ObservableObject } from "../../ObservableObject"
import { IAuthService } from "../AuthService"
import { IScreen } from "../IScreen"
import { IMessageService } from "../MessageService"
import { handleError } from "../utils"
import * as view from "./SignInScreen.view"

export class SignInScreen extends ObservableObject implements IScreen {
    @isnonreactive private readonly _authService: IAuthService
    @isnonreactive private readonly _messageService: IMessageService
    private _login = ""
    private _password = ""

    get login(): string { return this._login }
    get password(): string { return this._password }

    constructor(authService: IAuthService, messageService: IMessageService) {
        super()
        this._authService = authService
        this._messageService = messageService
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
    @options({ reentrance: Reentrance.WaitAndRestart })
    async signIn(): Promise<void> {
        try {
            await this._authService.signIn(this.login, this.password)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }

    @cached
    render(): JSX.Element {
        return <view.SignInScreen screen={this} />
    }
}
