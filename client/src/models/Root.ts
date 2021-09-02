import { reaction, transaction, Transaction, unobservable } from "reactronic"
import { Disposer } from "../Disposer"
import { ObservableObject } from "../ObservableObject"
import { Auth } from "../services"
import { App } from "./App"
import { SignIn } from "./SignIn"
import { WindowManager } from "./WindowManager"

export class Root extends ObservableObject {
  @unobservable readonly auth = new Auth("user")
  @unobservable readonly signIn = new SignIn(this.auth)
  @unobservable readonly windowManager = new WindowManager()
  @unobservable private readonly disposer = new Disposer()
  private _app: App | null = null

  get app(): App | null { return this._app }

  override dispose(): void {
    Transaction.run(() => {
      this.auth.dispose()
      this.signIn.dispose()
      this.disposer.dispose()
      this.app?.dispose()
      super.dispose()
    })
  }

  @transaction
  private createApp(): void {
    this._app = new App()
  }

  @transaction
  private disposeApp(): void {
    if (this._app) {
      this.disposer.enqueue(this._app)
      this._app = null
    }
  }

  @reaction
  private app_created_on_sign_in_and_disposed_on_sign_out(): void {
    this.auth.user ? this.createApp() : this.disposeApp()
  }
}
