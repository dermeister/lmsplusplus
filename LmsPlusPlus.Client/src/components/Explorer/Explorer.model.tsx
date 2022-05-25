import React from "react"
import { transaction, Transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ExplorerView } from "./Explorer.view"
import { NodeModel } from "./Node.model"

export abstract class ExplorerModel<T> extends ObservableObject {
    private _oldNodes = new Map<string, NodeModel<unknown>>()
    private _newNodes = new Map<string, NodeModel<unknown>>()
    private _selectedNode: NodeModel<T> | null = null
    private _children: readonly NodeModel<unknown>[] = []

    get children(): readonly NodeModel<unknown>[] { return this._children }
    get selectedNode(): NodeModel<T> | null { return this._selectedNode }

    protected constructor(children: readonly NodeModel<unknown>[]) {
        super()
        this._children = this.reconcileChildren(children)
    }

    render(): JSX.Element {
        return <ExplorerView model={this} />
    }

    @transaction
    setSelectedNode(node: NodeModel<T> | null): void {
        this._selectedNode = node
    }

    override dispose(): void {
        Transaction.run(() => {
            this._oldNodes.forEach(n => n.dispose())
            this._oldNodes.toMutable().clear()
            this._newNodes.toMutable().clear()
            super.dispose()
        })
    }

    @transaction
    protected updateChildren<K>(newChildren: readonly NodeModel<K>[]): void {
        this._children = this.reconcileChildren(newChildren)
    }

    private reconcileChildren<K>(nodes: readonly NodeModel<K>[]): readonly NodeModel<K>[] {
        const newChildren = this.visitNodes(nodes)
        for (const node of this._oldNodes.values()) {
            if (node === this._selectedNode)
                this._selectedNode = null
            node.dispose()
        }
        this._oldNodes = this._newNodes
        this._newNodes = new Map()
        return newChildren as readonly NodeModel<K>[]
    }

    private visitNode<K>(node: NodeModel<K>): NodeModel<K> {
        let result = node
        if (this._oldNodes.has(node.key)) {
            const oldNode = this._oldNodes.get(node.key) as NodeModel<K>
            const children = node.children ? this.visitNodes(node.children) : null
            oldNode.updateNode(node.title, node.item, children)
            const oldNodes = this._oldNodes.toMutable()
            oldNodes.delete(oldNode.key)
            this._oldNodes = oldNodes
            node.dispose()
            result = oldNode
        }
        const newNodes = this._newNodes.toMutable()
        newNodes.set(result.key, result)
        this._newNodes = newNodes
        return result
    }

    private visitNodes<K>(nodes: readonly NodeModel<K>[]): NodeModel<K>[] {
        return nodes.map(node => this.visitNode(node))
    }
}
