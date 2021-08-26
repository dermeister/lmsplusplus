import { transaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ContextMenu } from "../ContextMenu"
import { NodeVisitor } from "./NodeVisitor"

export abstract class Node extends ObservableObject {
  @unobservable readonly key: string
  @unobservable readonly contextMenu: ContextMenu | null
  private _title: string

  get title(): string { return this._title }

  protected constructor(title: string, key: string, hasContextMenu: boolean) {
    super()
    this._title = title
    this.key = key
    this.contextMenu = hasContextMenu ? new ContextMenu() : null
  }

  abstract accept(visitor: NodeVisitor): Node

  @transaction
  updateNode(title: string): void { this._title = title }

  override dispose(): void {
    Transaction.run(() => {
      this.contextMenu?.dispose()
      super.dispose()
    })
  }
}
