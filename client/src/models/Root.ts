import { reaction, transaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Auth } from "../services"
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
      super.dispose()
    })
  }

  @reaction
  private app_created_on_sign_in_and_disposed_on_sign_out(): void {
    this.auth.user ? this.createApp() : this.disposeApp()
  }

  @transaction
  private createApp(): void {
    this._app = new App()
  }

  @transaction
  private disposeApp(): void {
    this._app?.dispose()
    this._app = null
  }
}
