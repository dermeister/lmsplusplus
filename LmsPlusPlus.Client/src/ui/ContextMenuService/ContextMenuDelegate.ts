type OnClose = () => void

export class ContextMenuDelegate {
    readonly contextMenuItems: JSX.Element[]
    readonly x: number
    readonly y: number
    readonly onClose: OnClose

    constructor(contextMenu: JSX.Element[], x: number, y: number, onClose: OnClose) {
        this.contextMenuItems = contextMenu
        this.x = x
        this.y = y
        this.onClose = onClose
    }
}
