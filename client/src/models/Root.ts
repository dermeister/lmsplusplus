import { reaction, standalone, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Auth } from "../services/Auth"
import { App } from "./App"
import { SignIn } from "./SignIn"
import { WindowManager } from "./WindowManager"

export class Root extends ObservableObject {
  @unobservable readonly auth = new Auth("user")
  @unobservable readonly signIn = new SignIn(this.auth)
  @unobservable readonly windowManager = new WindowManager()
  private _app: App | null = null

  get app(): App | null { return this._app }

  override dispose(): void {
    Transaction.run(() => {
      this.auth.dispose()
      this.signIn.dispose()
      this.app?.dispose()
    })
  }

  @reaction
  private app_created_on_signed_in_and_disposed_on_sign_out(): void {
    if (this.auth.user)
      standalone(Transaction.run, () => this._app = new App())
    else {
      this._app?.dispose()
      this._app = null
    }
  }
}
