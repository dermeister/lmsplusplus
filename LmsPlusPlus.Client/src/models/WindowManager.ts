import { ContextMenu } from "./ContextMenu"

export class WindowManager {
    private openedContextMenu: ContextMenu | null = null

    openContextMenu(contextMenu: ContextMenu, x: number, y: number): void {
        if (this.openedContextMenu)
            this.closeContextMenu()
        contextMenu.open(x, y)
        this.openedContextMenu = contextMenu
    }

    closeContextMenu(): void {
        this.openedContextMenu?.close()
        this.openedContextMenu = null
    }
}
