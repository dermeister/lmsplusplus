import { cached, ObservableObject, transaction, unobservable } from "reactronic"
import { ContextMenu } from "./ContextMenu"

export abstract class Explorer extends ObservableObject {
  @unobservable abstract readonly roots: ExplorerNode[]
}

export abstract class ExplorerNode extends ObservableObject {
  @unobservable readonly title: string
  @unobservable readonly key: string
  @unobservable contextMenu = new ContextMenu()

  constructor(title: string, key: string) {
    super()
    this.title = title
    this.key = key
  }

  abstract click(): void
}

export class ExplorerGroupNode extends ExplorerNode {
  private _isOpened = false
  @unobservable readonly children: ExplorerNode[]

  constructor(title: string, key: string, children: ExplorerNode[]) {
    super(title, key)
    this.children = children
  }

  @cached
  get isOpened(): boolean {
    return this._isOpened
  }

  @transaction
  click(): void {
    this._isOpened = !this._isOpened
  }
}

export class ExplorerItemNode extends ExplorerNode {
  click(): void {}
}
