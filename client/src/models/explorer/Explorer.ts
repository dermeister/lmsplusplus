import { transaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ExplorerReconciler } from "./ExplorerReconciler"
import { GroupNode } from "./GroupNode"
import { ItemNode } from "./ItemNode"
import { Node } from "./Node"

class ExplorerRootNode extends GroupNode {
  override get isOpened(): boolean { return true }

  constructor(children: readonly Node[]) {
    super("Explorer Root", "explorer-root", children)
  }

  @transaction
  updateExplorerRootNode(children: readonly Node[]): void {
    this.updateGroupNode(this.title, children)
  }
}

export abstract class Explorer<T> extends ObservableObject {
  @unobservable readonly root: ExplorerRootNode
  @unobservable private readonly reconciler: ExplorerReconciler<this, T> = new ExplorerReconciler(this)
  private _selectedNode: ItemNode<T> | null = null

  get selectedNode(): ItemNode<T> | null { return this._selectedNode }
  protected get children(): readonly Node[] { return this.root.children }

  protected constructor(children: readonly Node[] = []) {
    super()
    this.root = new ExplorerRootNode(children)
    this.reconciler.reconcile(children)
  }

  @transaction
  updateExplorer(children: readonly Node[]): void {
    this.reconciler.reconcile(children)
  }

  @transaction
  setSelectedNode(node: ItemNode<T> | null): void {
    this._selectedNode = node
  }

  override dispose(): void {
    Transaction.run(() => {
      this.root.dispose()
      this.reconciler.dispose()
      super.dispose()
    })
  }
}
