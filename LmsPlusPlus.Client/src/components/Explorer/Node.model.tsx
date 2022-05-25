import React from "react"
import { transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { IContextMenuService } from "../ContextMenuService"
import { NodeView } from "./Node.view"

export class NodeModel<T> extends ObservableObject {
    @unobservable readonly key: string
    @unobservable readonly contextMenuService: IContextMenuService | null
    private _title: string
    private _children: NodeModel<unknown>[] | null
    private _isOpened = false
    private _item: T

    get title(): string { return this._title }
    get children(): NodeModel<unknown>[] | null { return this._children }
    get isGroupNode(): boolean { return this._children !== null }
    get isOpened(): boolean { return this._isOpened }
    get item(): T { return this._item }

    constructor(key: string, item: T, title: string, contextMenuService: IContextMenuService | null = null, children: NodeModel<unknown>[] | null = null) {
        super()
        this.key = key
        this._item = item
        this._title = title
        this._children = children
        this.contextMenuService = contextMenuService
    }

    render(): JSX.Element {
        return <NodeView model={this} />
    }

    @transaction
    updateNode(title: string, item: T, children: NodeModel<unknown>[] | null): void {
        this._title = title
        this._item = item
        if (children) {
            this.ensureGroupNode()
            this._children = children
        }
    }

    @transaction
    toggle(): void {
        this.ensureGroupNode()
        this._isOpened = !this._isOpened
    }

    renderContextMenu(): JSX.Element | null {
        return null
    }

    private ensureGroupNode(): void {
        if (!this.isGroupNode)
            throw new Error("Node is not a group node.")
    }
}
