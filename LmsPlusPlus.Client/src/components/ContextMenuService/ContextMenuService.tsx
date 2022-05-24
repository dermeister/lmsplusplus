import React from "react"
import ReactDOM from "react-dom"
import { transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import { ContextMenuContainer } from "./ContextMenuContainer"

export interface IContextMenuService {
    open(contextMenu: JSX.Element, x: number, y: number): void

    close(): void
}

export class ContextMenuService extends ObservableObject implements IContextMenuService {
    @unobservable private static readonly contextMenuContainer = document.getElementById("context-menu") as Element

    @transaction
    open(contextMenu: JSX.Element, x: number, y: number): void {
        ReactDOM.render(<ContextMenuContainer model={this} contextMenu={contextMenu} x={x} y={y} />, ContextMenuService.contextMenuContainer)
    }

    @transaction
    close(): void {
        ReactDOM.unmountComponentAtNode(ContextMenuService.contextMenuContainer)
    }
}
