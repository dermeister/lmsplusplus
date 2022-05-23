import React from "react"
import { Ref, Rx, Transaction, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { SidePanel } from "./SidePanel.view"

export class SidePanelModel extends ObservableObject {
    @unobservable private readonly _title: Ref<string>
    @unobservable private readonly _isPulsing: Ref<boolean>
    private _isOpened = true

    get title(): string { return this._title.value }
    get isOpened(): boolean { return this._isOpened }
    get isPulsing(): boolean { return this._isPulsing.value }

    constructor(title: Ref<string>, isPulsing: Ref<boolean>) {
        super()
        this._title = title
        this._isPulsing = isPulsing
    }

    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this._title)
            Rx.dispose(this._isPulsing)
            super.dispose()
        })
    }

    @transaction
    open(): void {
        this._isOpened = true
    }

    @transaction
    toggle(): void {
        this._isOpened = !this._isOpened
    }

    render(content: JSX.Element): JSX.Element {
        return <SidePanel model={this}>{content}</SidePanel>
    }
}
