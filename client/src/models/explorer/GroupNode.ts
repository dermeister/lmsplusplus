import { cached, transaction } from "reactronic"
import { Node } from "./Node"

export class GroupNode extends Node {
  protected _children: readonly Node[] = []
  private _isOpened = false

  @cached get children(): readonly Node[] { return this._children }
  @cached get isOpened(): boolean { return this._isOpened }

  @transaction
  toggle(): void { this._isOpened = !this._isOpened }
}
