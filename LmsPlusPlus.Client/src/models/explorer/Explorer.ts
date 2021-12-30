import { reaction, transaction, Transaction } from "reactronic"
import { GroupNode } from "./GroupNode"
import { ItemNode } from "./ItemNode"
import { Node } from "./Node"
import { NodeVisitor } from "./NodeVisitor"

export abstract class Explorer<TItem, TChild extends Node = Node> extends NodeVisitor {
    private oldNodes = new Map<string, Node>()
    private newNodes = new Map<string, Node>()
    private _selectedNode: ItemNode<TItem> | null = null
    private _children: readonly TChild[] = []

    get children(): readonly TChild[] { return this._children }
    get selectedNode(): ItemNode<TItem> | null { return this._selectedNode }

    @transaction
    setSelectedNode(node: ItemNode<TItem> | null): void {
        this._selectedNode = node
    }

    override visitNode(node: Node): Node {
        const result = super.visitNode(node)
        if (result !== node) { // visitNode returned reused old node
            const oldNodes = this.oldNodes.toMutable()
            oldNodes.delete(result.key)
            this.oldNodes = oldNodes
            node.dispose()
        }
        const newNodes = this.newNodes.toMutable()
        newNodes.set(result.key, result)
        this.newNodes = newNodes
        return result
    }

    override visitItemNode(node: ItemNode<TItem>): ItemNode<TItem> {
        let result = super.visitItemNode(node) as ItemNode<TItem>
        if (this.oldNodes.has(result.key)) {
            const oldNode = this.oldNodes.get(result.key) as ItemNode<TItem>
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

    protected abstract createChildren(): readonly TChild[]

    @reaction
    private updateChildren(): void {
        const newChildren = this.createChildren()
        this._children = this.reconcileChildren(newChildren)
    }

    @transaction
    private reconcileChildren(nodes: readonly TChild[]): readonly TChild[] {
        const newChildren = this.visitNodes(nodes)
        for (const node of this.oldNodes.values()) {
            if (node === this._selectedNode)
                this._selectedNode = null
            node.dispose()
        }
        this.oldNodes = this.newNodes
        this.newNodes = new Map()
        return newChildren as TChild[]
    }
}
