import { Screen } from "./Screen"
import { transaction } from "reactronic"

export class SignInScreen extends Screen {
    private _login = ""
    private _password = ""

    get login(): string { return this._login }
    get password(): string { return this._password }

    @transaction
    setLogin(login: string): void {
        this._login = login
    }

    @transaction
    setPassword(password: string): void {
        this._password = password
    }
}
