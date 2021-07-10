import { cached, transaction, unobservable } from "reactronic"
import { Node } from "./Node"

export class GroupNode extends Node {
  @unobservable readonly title: string
  private _children: Node[] = []
  private _isOpened = false

  @cached get children(): Node[] { return this._children }
  @cached get isOpened(): boolean { return this._isOpened }

  constructor(title: string) {
    super(title)
    this.title = title
  }

  @transaction
  toggle(): void {
    this._isOpened = !this._isOpened
  }
}
