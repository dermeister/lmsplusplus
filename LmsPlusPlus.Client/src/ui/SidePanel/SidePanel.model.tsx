import React from "react"
import { cached, isnonreactive, Ref, Rx, Transaction, transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import * as view from "./SidePanel.view"

export class SidePanel extends ObservableObject {
    @isnonreactive private readonly _title: Ref<string>
    @isnonreactive private readonly _shouldShowLoader: Ref<boolean>
    private _isOpened = true

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
    render(content: JSX.Element): JSX.Element {
        return (
            <view.SidePanel isOpened={this._isOpened}
                shouldShowLoader={this._shouldShowLoader.value}
                title={this._title.value}>
                {content}
            </view.SidePanel>
        )
    }
}
