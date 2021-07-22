import { transaction } from "reactronic"
import { Auth } from "../services/Auth"
import { App } from "./App"
import { SignIn } from "./SignIn"
import { WindowManager } from "./WindowManager"

export class Root {
  readonly auth = new Auth("user")
  readonly signIn = new SignIn(this.auth)
  readonly app = new App()
  readonly windowManager = new WindowManager()

  @transaction
  dispose(): void {
    this.auth.dispose()
    this.signIn.dispose()
    this.app.dispose()
  }
}
