import { unobservable } from "reactronic"
import { Node } from "./Node"

export class ItemNode<T> extends Node {
  @unobservable readonly item: T

  constructor(title: string, item: T) {
    super(title)
    this.item = item
  }
}
