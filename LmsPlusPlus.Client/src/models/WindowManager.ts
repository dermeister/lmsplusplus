import { ContextMenu } from "./ContextMenu"

export class WindowManager {
    private _openedContextMenu: ContextMenu | null = null

    openContextMenu(contextMenu: ContextMenu, x: number, y: number): void {
        if (this._openedContextMenu)
            this.closeContextMenu()
        contextMenu.open(x, y)
        this._openedContextMenu = contextMenu
    }

    closeContextMenu(): void {
        this._openedContextMenu?.close()
        this._openedContextMenu = null
    }
}
