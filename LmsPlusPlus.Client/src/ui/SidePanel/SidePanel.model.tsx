import React from "react"
import { cached, isnonreactive, options, Ref, Rx, Transaction, transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import * as view from "./SidePanel.view"

export class SidePanel extends ObservableObject {
    @isnonreactive private readonly _title: Ref<string>
    @isnonreactive private readonly _shouldShowLoader: Ref<boolean>
    private _isOpened = true

    get title(): string { return this._title.value }
    get shouldShowLoader(): boolean { return this._shouldShowLoader.value }
    get isOpened(): boolean { return this._isOpened }

    constructor(title: Ref<string>, shouldShowLoader: Ref<boolean>) {
        super()
        this._title = title
        this._shouldShowLoader = shouldShowLoader
    }

    override dispose(): void {
        Transaction.run(null, () => {
            Rx.dispose(this._title)
            Rx.dispose(this._shouldShowLoader)
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

    @cached
    @options({ triggeringArgs: true })
    render(content: JSX.Element): JSX.Element {
        return <view.SidePanel sidePanel={this}>{content}</view.SidePanel>
    }
}
