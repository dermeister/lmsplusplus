import { transaction } from "reactronic"
import { Node } from "./Node"
import { NodeVisitor } from "./NodeVisitor"

export class GroupNode extends Node {
  private _children: readonly Node[]
  private _isOpened = false

  get children(): readonly Node[] { return this._children }
  get isOpened(): boolean { return this._isOpened }

  constructor(title: string, key: string, hasContextMenu: boolean, children: readonly Node[]) {
    super(title, key, hasContextMenu)
    this._children = children
  }

  @transaction
  toggle(): void { this._isOpened = !this._isOpened }

  @transaction
  updateGroupNode(title: string, children: readonly Node[]): void {
    this.updateNode(title)
    this._children = children
  }

  override accept(visitor: NodeVisitor): Node { return visitor.visitGroupNode(this) }
}
