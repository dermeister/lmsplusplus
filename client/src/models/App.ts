import { unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Views } from "./Views"

export class App extends ObservableObject {
  @unobservable readonly views = new Views()

  dispose(): void {
    this.view.dispose()
    super.dispose()
  }
}
