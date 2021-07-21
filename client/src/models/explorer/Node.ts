import { cached, transaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ContextMenu } from "../ContextMenu"
import { NodeVisitor } from "./NodeVisitor"

export abstract class Node extends ObservableObject {
  @unobservable readonly key: string
  @unobservable readonly contextMenu = new ContextMenu()
  private _title: string

  @cached get title(): string { return this._title }

  constructor(title: string, key: string) {
    super()
    this._title = title
    this.key = key
  }

  @transaction
  updateNode(title: string): void { this._title = title }

  abstract accept(_visitor: NodeVisitor): Node

  override dispose(): void {
    Transaction.run(() => {
      this.contextMenu.dispose()
      super.dispose()
    })
  }
}
