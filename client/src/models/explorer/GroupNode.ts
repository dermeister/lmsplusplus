import { cached, Transaction, transaction } from "reactronic"
import { Node } from "./Node"
import { NodeVisitor } from "./NodeVisitor"

export class GroupNode extends Node {
  private _children: readonly Node[]
  private _isOpened = false

  @cached get children(): readonly Node[] { return this._children }
  get nonCachedChildren(): readonly Node[] { return this._children }
  @cached get isOpened(): boolean { return this._isOpened }

  constructor(title: string, key: string, children: readonly Node[]) {
    super(title, key)
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

  override dispose(): void {
    Transaction.run(() => {
      this._children.forEach(c => c.dispose())
      super.dispose()
    })
  }
}
