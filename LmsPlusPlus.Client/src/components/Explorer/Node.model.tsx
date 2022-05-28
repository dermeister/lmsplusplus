import React from "react"
import { cached, transaction, isnonreactive } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { IContextMenuService } from "../ContextMenuService"
import * as view from "./Node.view"

export class Node<T> extends ObservableObject {
    @isnonreactive readonly key: string
    @isnonreactive private readonly _contextMenuService: IContextMenuService | null
    private _title: string
    private _children: Node<unknown>[] | null
    private _isOpened = false
    private _item: T

    get title(): string { return this._title }
    get children(): Node<unknown>[] | null { return this._children }
    get isGroupNode(): boolean { return this._children !== null }
    get isOpened(): boolean { return this._isOpened }
    get item(): T { return this._item }
    protected get contextMenuService(): IContextMenuService | null { return this._contextMenuService }

    constructor(key: string, item: T, title: string, contextMenuService: IContextMenuService | null = null,
        children: Node<unknown>[] | null = null) {
        super()
        this.key = key
        this._item = item
        this._title = title
        this._children = children
        this._contextMenuService = contextMenuService
    }

    @cached
    render(): JSX.Element {
        return <view.Node node={this} contextMenuService={this._contextMenuService} />
    }

    @transaction
    update(title: string, item: T, children: Node<unknown>[] | null): void {
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
