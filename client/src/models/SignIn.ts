import { cached, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Auth } from "../services/Auth"

export class SignIn extends ObservableObject {
  @unobservable readonly auth: Auth
  private _login = ""
  private _password = ""
  private _error = false

  @cached get login(): string { return this._login }
  @cached get password(): string { return this._password }
  @cached get error(): boolean { return this._error }

  constructor(auth: Auth) {
    super()
    this.auth = auth
  }

  @transaction
  setLogin(login: string): void { this._login = login }

  @transaction
  setPassword(password: string): void { this._password = password }

  @transaction
  async signIn(): Promise<void> {
    const success = await this.auth.signIn(this._login, this._password)
    this._error = !success
  }
}
