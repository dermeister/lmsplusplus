import { Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Auth } from "../services/Auth"
import { App } from "./App"
import { SignIn } from "./SignIn"
import { WindowManager } from "./WindowManager"

export class Root extends ObservableObject {
  @unobservable readonly auth = new Auth("user")
  @unobservable readonly signIn = new SignIn(this.auth)
  @unobservable readonly app = new App()
  @unobservable readonly windowManager = new WindowManager()

  override dispose(): void {
    Transaction.run(() => {
      this.auth.dispose()
      this.signIn.dispose()
      this.app.dispose()
      super.dispose()
    })
  }
}
