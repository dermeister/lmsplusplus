import { transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { NodeVisitor } from "./NodeVisitor"

export abstract class Node extends ObservableObject {
    @unobservable readonly key: string
    private _title: string

    get title(): string { return this._title }

    protected constructor(title: string, key: string) {
        super()
        this._title = title
        this.key = key
    }

    abstract accept(visitor: NodeVisitor): Node

    @transaction
    updateNode(title: string): void {
        this._title = title
    }
}

export class ItemNode<T> extends Node {
    private _item: T

    get item(): T { return this._item }

    constructor(title: string, key: string, value: T) {
        super(title, key)
        this._item = value
    }

    @transaction
    updateItemNode(title: string, item: T): void {
        this.updateNode(title)
        this._item = item
    }

    override accept(visitor: NodeVisitor): Node {
        return visitor.visitItemNode(this)
    }
}

export class GroupNode extends Node {
    private _children: readonly Node[]
    private _isOpened = false

    get children(): readonly Node[] { return this._children }
    get isOpened(): boolean { return this._isOpened }

    constructor(title: string, key: string, children: readonly Node[]) {
        super(title, key)
        this._children = children
    }

    @transaction
    toggle(): void {
        this._isOpened = !this._isOpened
    }

    @transaction
    updateGroupNode(title: string, children: readonly Node[]): void {
        this.updateNode(title)
        this._children = children
    }

    override accept(visitor: NodeVisitor): Node {
        return visitor.visitGroupNode(this)
    }
}

