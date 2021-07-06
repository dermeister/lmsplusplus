import { ObservableObject, unobservable } from "reactronic"
import { Views } from "./Views"

export class App extends ObservableObject {
  @unobservable readonly views = new Views()
}
