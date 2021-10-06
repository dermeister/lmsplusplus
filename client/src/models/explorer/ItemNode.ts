import { transaction } from "reactronic"
import { Node } from "./Node"
import { NodeVisitor } from "./NodeVisitor"

export class ItemNode<T> extends Node {
  private _item: T

  get item(): T { return this._item }

  constructor(title: string, key: string, value: T) {
    super(title, key)
    this._item = value
  }

  @transaction
  updateItemNode(title: string, item: T): void {
    this.updateNode(title)
    this._item = item
  }

  override accept(visitor: NodeVisitor): Node { return visitor.visitItemNode(this) }
}
