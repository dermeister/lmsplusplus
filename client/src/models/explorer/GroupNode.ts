import { cached, transaction } from "reactronic"
import { Node } from "./Node"

export class GroupNode extends Node {
  protected _children: Node[] = []
  private _isOpened = false

  @cached get children(): Node[] { return this._children }
  @cached get isOpened(): boolean { return this._isOpened }

  @transaction
  toggle(): void { this._isOpened = !this._isOpened }
}
