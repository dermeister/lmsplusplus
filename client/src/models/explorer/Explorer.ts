import { cached, Transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ItemNode } from "./ItemNode"

export class Explorer<T> extends ObservableObject {
  private _activeNode: ItemNode<T> | null = null

  @cached get activeNode(): ItemNode<T> | null { return this._activeNode }

  activateNode(node: ItemNode<T>): void { Transaction.run(() => { this._activeNode = node }) }
}
