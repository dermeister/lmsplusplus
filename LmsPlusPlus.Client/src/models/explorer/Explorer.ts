import { transaction, Transaction } from "reactronic"
import { Node, GroupNode, ItemNode } from "./Node"
import { NodeVisitor } from "./NodeVisitor"

export abstract class Explorer<TItem, TChild extends Node = Node> extends NodeVisitor {
    private _oldNodes = new Map<string, Node>()
    private _newNodes = new Map<string, Node>()
    private _selectedNode: ItemNode<TItem> | null = null
    private _children: readonly TChild[] = []

    get children(): readonly TChild[] { return this._children }
    get selectedNode(): ItemNode<TItem> | null { return this._selectedNode }

    protected constructor(children: readonly TChild[]) {
        super()
        this._children = this.reconcileChildren(children)
    }

    @transaction
    setSelectedNode(node: ItemNode<TItem> | null): void {
        this._selectedNode = node
    }

    override visitNode(node: Node): Node {
        const result = super.visitNode(node)
        if (result !== node) { // visitNode returned reused old node
            const oldNodes = this._oldNodes.toMutable()
            oldNodes.delete(result.key)
            this._oldNodes = oldNodes
            node.dispose()
        }
        const newNodes = this._newNodes.toMutable()
        newNodes.set(result.key, result)
        this._newNodes = newNodes
        return result
    }

    override visitItemNode(node: ItemNode<TItem>): ItemNode<TItem> {
        let result = super.visitItemNode(node) as ItemNode<TItem>
        if (this._oldNodes.has(result.key)) {
            const oldNode = this._oldNodes.get(result.key) as ItemNode<TItem>
            oldNode.updateItemNode(result.title, result.item)
            result = oldNode
        }
        return result
    }

    override visitGroupNode(node: GroupNode): GroupNode {
        let result = super.visitGroupNode(node)
        if (this._oldNodes.has(result.key)) {
            const oldNode = this._oldNodes.get(result.key) as GroupNode
            oldNode.updateGroupNode(result.title, result.children)
            result = oldNode
        }
        return result
    }

    override dispose(): void {
        Transaction.run(() => {
            this._oldNodes.forEach(n => n.dispose())
            super.dispose()
        })
    }

    @transaction
    protected updateChildren(newChildren: readonly TChild[]): void {
        this._children = this.reconcileChildren(newChildren)
    }

    private reconcileChildren(nodes: readonly TChild[]): readonly TChild[] {
        const newChildren = this.visitNodes(nodes)
        for (const node of this._oldNodes.values()) {
            if (node === this._selectedNode)
                this._selectedNode = null
            node.dispose()
        }
        this._oldNodes = this._newNodes
        this._newNodes = new Map()
        return newChildren as readonly TChild[]
    }
}
