import { standalone, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Views } from "./Views"

export class App extends ObservableObject {
  @unobservable readonly views = new Views()

  dispose(): void {
    standalone(Transaction.run, () => {
      this.views.dispose()
      super.dispose()
    })
  }
}
