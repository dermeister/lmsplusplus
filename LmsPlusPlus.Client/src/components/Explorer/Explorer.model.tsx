import React from "react"
import { cached, transaction, Transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import * as view from "./Explorer.view"
import { Node } from "./Node.model"

export abstract class Explorer<T> extends ObservableObject {
    private _oldNodes = new Map<string, Node<unknown>>()
    private _newNodes = new Map<string, Node<unknown>>()
    private _selectedNode: Node<T> | null = null
    private _children: readonly Node<unknown>[] = []

    get selectedNode(): Node<T> | null { return this._selectedNode }
    protected get children(): readonly Node<unknown>[] { return this._children }

    protected constructor(children: readonly Node<unknown>[]) {
        super()
        this._children = this.reconcileChildren(children)
    }

    @cached
    render(): JSX.Element {
        return <view.ExplorerView explorer={this} children={this._children} />
    }

    @transaction
    setSelectedNode(node: Node<T> | null): void {
        this._selectedNode = node
    }

    override dispose(): void {
        Transaction.run(() => {
            this._oldNodes.forEach(n => n.dispose())
            this._oldNodes.toMutable().clear()
            super.dispose()
        })
    }

    @transaction
    protected updateChildren<K>(newChildren: readonly Node<K>[]): void {
        this._children = this.reconcileChildren(newChildren)
    }

    private reconcileChildren<K>(nodes: readonly Node<K>[]): readonly Node<K>[] {
        const newChildren = this.visitNodes(nodes)
        for (const node of this._oldNodes.values()) {
            if (node === this._selectedNode)
                this._selectedNode = null
            node.dispose()
        }
        this._oldNodes = this._newNodes
        this._newNodes = new Map()
        return newChildren as readonly Node<K>[]
    }

    private visitNode<K>(node: Node<K>): Node<K> {
        let result = node
        if (this._oldNodes.has(node.key)) {
            const oldNode = this._oldNodes.get(node.key) as Node<K>
            const children = node.children ? this.visitNodes(node.children) : null
            oldNode.update(node.title, node.item, children)
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

    private visitNodes<K>(nodes: readonly Node<K>[]): Node<K>[] {
        return nodes.map(node => this.visitNode(node))
    }
}
