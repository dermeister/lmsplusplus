import { ContextMenu } from "./ContextMenu"

export interface IContextMenuService {
    open(contextMenu: ContextMenu, x: number, y: number): void

    close(): void
}

export class ContextMenuServiceModel implements IContextMenuService {
    private _openedContextMenu: ContextMenu | null = null

    open(contextMenu: ContextMenu, x: number, y: number): void {
        if (this._openedContextMenu)
            this.close()
        contextMenu.open(x, y)
        this._openedContextMenu = contextMenu
    }

    close(): void {
        this._openedContextMenu?.close()
        this._openedContextMenu = null
    }
}
