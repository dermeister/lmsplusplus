import { unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ContextMenu } from "../ContextMenu"

export class Node extends ObservableObject {
  private static nextId = 1
  @unobservable readonly title: string
  @unobservable readonly contextMenu = new ContextMenu()
  @unobservable readonly id = Node.nextId++

  constructor(title: string) {
    super()
    this.title = title
  }

  dispose(): void {
    this.contextMenu.dispose()
    super.dispose()
  }
}
