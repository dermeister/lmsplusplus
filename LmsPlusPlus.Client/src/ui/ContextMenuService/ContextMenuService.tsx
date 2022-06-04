import React from "react"
import ReactDOM from "react-dom"
import { isnonreactive, transaction } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ContextMenuContainer } from "./ContextMenuContainer"
import { ContextMenuDelegate } from "./ContextMenuDelegate"

export interface IContextMenuService {
    open(contextMenuDelegate: ContextMenuDelegate): void

    close(): void
}

export class ContextMenuService extends ObservableObject implements IContextMenuService {
    @isnonreactive private static readonly contextMenuContainer = document.getElementById("context-menu") as Element
    private _contextMenuDelegate: ContextMenuDelegate | null = null

    @transaction
    open(contextMenuDelegate: ContextMenuDelegate): void {
        if (contextMenuDelegate.contextMenuItems.length > 0) {

            this._contextMenuDelegate = contextMenuDelegate
            const container = (
                <ContextMenuContainer contextMenuService={this}
                    contextMenuItems={contextMenuDelegate.contextMenuItems}
                    x={contextMenuDelegate.x}
                    y={contextMenuDelegate.y} />
            )
            ReactDOM.render(container, ContextMenuService.contextMenuContainer)
        }
    }

    @transaction
    close(): void {
        ReactDOM.unmountComponentAtNode(ContextMenuService.contextMenuContainer)
        this._contextMenuDelegate?.onClose()
        this._contextMenuDelegate = null
    }
}
