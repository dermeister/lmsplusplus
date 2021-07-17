import { Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Views } from "./Views"

export class App extends ObservableObject {
  @unobservable readonly views = new Views()

  override dispose(): void {
    Transaction.run(() => {
      this.views.dispose()
      super.dispose()
    })
  }
}
