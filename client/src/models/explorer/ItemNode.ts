import { unobservable } from "reactronic"
import { Node } from "./Node"

export class ItemNode<T> extends Node {
  @unobservable readonly title: string
  @unobservable readonly item: T

  constructor(title: string, item: T) {
    super(title)
    this.title = title
    this.item = item
  }
}
