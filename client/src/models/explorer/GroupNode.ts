import { cached, transaction, unobservable } from "reactronic"
import { Node } from "./Node"

export class GroupNode extends Node {
  @unobservable readonly title: string
  private _children: Node[] = []
  private _isOpened = false

  constructor(title: string) {
    super(title)
    this.title = title
  }

  @cached get children(): Node[] {
    return this._children
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
