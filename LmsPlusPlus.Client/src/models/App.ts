import { Transaction, unobservable } from "reactronic"
import { Database } from "../database"
import { ObservableObject } from "../ObservableObject"
import { WindowManager } from "./WindowManager"
import { Screen } from "./Screen"
import { MainScreen } from "./MainScreen"

export class App extends ObservableObject {
  @unobservable readonly windowManager = new WindowManager()
  @unobservable private readonly database = new Database()
  private readonly _screen: Screen = new MainScreen(this.database)

  get screen(): Screen { return this._screen }

  override dispose(): void {
    Transaction.run(() => {
      this._screen.dispose()
      this.database.dispose()
      super.dispose()
    })
  }
}
