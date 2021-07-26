import { reaction, standalone, Transaction, transaction, unobservable } from "reactronic"
import { Explorer } from "./Explorer"
import { GroupNode } from "./GroupNode"
import { ItemNode } from "./ItemNode"
import { Node } from "./Node"
import { NodeVisitor } from "./NodeVisitor"

export class ExplorerReconciler<T extends Explorer<K>, K> extends NodeVisitor {
  @unobservable private readonly explorer: T
  private oldNodes = new Map<string, Node>()
  private newNodes = new Map<string, Node>()
  private nodesToDispose: Node[] = []

  constructor(explorer: T) {
    super()
    this.explorer = explorer
  }

  @transaction
  reconcile(children: readonly Node[]): void {
    const reconciledChildren = this.visitNodes(children)
    this.explorer.root.updateExplorerRootNode(reconciledChildren)
    for (const node of this.oldNodes.values()) {
      if (node === this.explorer.selectedNode)
        this.explorer.setSelectedNode(null)
      this.addToNodesToDispose(node)
    }
    this.oldNodes = this.newNodes
    this.newNodes = new Map()
  }

  override visitNode(node: Node): Node {
    const result = super.visitNode(node)
    if (result !== node) { // visitNode returned reused old node
      const oldNodes = this.oldNodes.toMutable()
      oldNodes.delete(result.key)
      this.oldNodes = oldNodes
      this.addToNodesToDispose(node)
    }
    const newNodes = this.newNodes.toMutable()
    newNodes.set(result.key, result)
    this.newNodes = newNodes
    return result
  }

  override visitItemNode(node: ItemNode<K>): ItemNode<K> {
    let result = super.visitItemNode(node) as ItemNode<K>
    if (this.oldNodes.has(result.key)) {
      const oldNode = this.oldNodes.get(result.key) as ItemNode<K>
      oldNode.updateItemNode(result.title, result.item)
      result = oldNode
    }
    return result
  }

  override visitGroupNode(node: GroupNode): GroupNode {
    let result = super.visitGroupNode(node)
    if (this.oldNodes.has(result.key)) {
      const oldNode = this.oldNodes.get(result.key) as GroupNode
      oldNode.updateGroupNode(result.title, result.children)
      result = oldNode
    }
    return result
  }

  override dispose(): void {
    Transaction.run(() => {
      for (const node of this.oldNodes.values())
        node.dispose()
      super.dispose()
    })
  }

  @reaction
  private nodesToDispose_disposed(): void {
    if (this.nodesToDispose.length > 0)
      standalone(Transaction.run, () => {
        for (const node of this.nodesToDispose)
          node.dispose()
        this.nodesToDispose = []
      })
  }

  private addToNodesToDispose(node: Node): void {
    const nodesToDispose = this.nodesToDispose.toMutable()
    nodesToDispose.push(node)
    this.nodesToDispose = nodesToDispose
  }
}
