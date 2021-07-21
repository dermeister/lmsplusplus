import { ObservableObject } from "../../ObservableObject"
import { GroupNode } from "./GroupNode"
import { ItemNode } from "./ItemNode"
import { Node } from "./Node"

export abstract class NodeVisitor extends ObservableObject {
  visitNode(node: Node): Node { return node.accept(this) }

  visitNodes(nodes: readonly Node[]): readonly Node[] { return nodes.map(n => this.visitNode(n)) }

  visitItemNode(node: ItemNode<Object>): ItemNode<Object> { return node }

  visitGroupNode(node: GroupNode): GroupNode {
    const childNodes = this.visitNodes(node.nonCachedChildren)
    node.updateGroupNode(node.title, childNodes)
    return node
  }
}
