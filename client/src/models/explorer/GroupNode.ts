import { cached, transaction, unobservable } from "reactronic"
import { Node } from "./Node"

export class GroupNode extends Node {
  @unobservable readonly title: string
  @unobservable readonly children: Node[]
  private _isOpened = false

  constructor(title: string, children: Node[] = []) {
    super(title)
    this.title = title
    this.children = children
  }

  @cached
  get isOpened(): boolean {
    return this._isOpened
  }

  @transaction
  toggle(): void {
    this._isOpened = !this._isOpened
  }
}
