import { unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class View extends ObservableObject {
  @unobservable readonly title: string

  constructor(title: string) {
    super()
    this.title = title
  }
}
