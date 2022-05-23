import React, { useContext } from "react"
import { ContextMenu } from "./ContextMenu"
import { IContextMenuService } from "./ContextMenuService.model"

type OnContextMenuHandler = ((e: React.MouseEvent) => void)

export const WindowManagerContext = React.createContext<IContextMenuService | null>(null)

export function useContextMenu(contextMenu: ContextMenu): OnContextMenuHandler {
    const contextMenuService = useContext(WindowManagerContext)
    return e => {
        e.preventDefault()
        contextMenuService?.open(contextMenu, e.clientX, e.clientY)
    }
}
