import { unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class View extends ObservableObject {
  @unobservable readonly title: string
  @unobservable readonly key: string

  constructor(title: string, key: string) {
    super()
    this.title = title
    this.key = key
  }
}
