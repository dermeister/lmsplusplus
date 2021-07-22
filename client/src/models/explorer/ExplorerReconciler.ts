import { transaction, unobservable } from "reactronic"
import { Explorer } from "./Explorer"
import { GroupNode } from "./GroupNode"
import { ItemNode } from "./ItemNode"
import { Node } from "./Node"
import { NodeVisitor } from "./NodeVisitor"

export class ExplorerReconciler<T extends Explorer<K>, K> extends NodeVisitor {
  @unobservable private readonly explorer: T
  private oldNodes = new Map<string, Node>()
  private newNodes = new Map<string, Node>()

  constructor(explorer: T) {
    super()
    this.explorer = explorer
  }

  @transaction
  reconcile(children: readonly Node[]): void {
    this.explorer.root.updateExplorerRootNode(children)
    this.visitNode(this.explorer.root)
    for (const node of this.oldNodes.values()) {
      if (node === this.explorer.selectedNode)
        this.explorer.setSelectedNode(null)
      node.dispose()
    }
    this.oldNodes = this.newNodes
    this.newNodes = new Map()
  }

  override visitNode(node: Node): Node {
    const result = super.visitNode(node)
    this.addToNewNodes(result)
    return result
  }

  override visitItemNode(node: ItemNode<K>): ItemNode<K> {
    let result = super.visitItemNode(node) as ItemNode<K>
    if (this.oldNodes.has(result.key)) {
      const oldNode = this.oldNodes.get(result.key) as ItemNode<K>
      oldNode.updateItemNode(result.title, result.item)
      this.removeFromOldNodes(oldNode)
      result = oldNode
    }
    return result
  }

  override visitGroupNode(node: GroupNode): GroupNode {
    let result = super.visitGroupNode(node)
    if (this.oldNodes.has(result.key)) {
      const oldNode = this.oldNodes.get(result.key) as GroupNode
      oldNode.updateGroupNode(result.title, result.nonCachedChildren)
      this.removeFromOldNodes(oldNode)
      result = oldNode
    }
    return result
  }

  private removeFromOldNodes(node: Node): void {
    const oldNodes = this.oldNodes.toMutable()
    oldNodes.delete(node.key)
    this.oldNodes = oldNodes
  }

  private addToNewNodes(node: Node): void {
    const newNodes = this.newNodes.toMutable()
    newNodes.set(node.key, node)
    this.newNodes = newNodes
  }
}
