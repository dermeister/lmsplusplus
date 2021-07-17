import { Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ContextMenu } from "../ContextMenu"

export class Node extends ObservableObject {
  @unobservable readonly title: string
  @unobservable readonly contextMenu = new ContextMenu()
  @unobservable readonly id = Node.nextId++
  private static nextId = 1

  constructor(title: string) {
    super()
    this.title = title
  }

  override dispose(): void {
    Transaction.run(() => {
      this.contextMenu.dispose()
      super.dispose()
    })
  }
}
