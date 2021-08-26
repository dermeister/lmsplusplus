import React, { useContext } from "react"
import * as models from "../models"

interface WindowManagerProps {
  model: models.WindowManager
  children: React.ReactNode
}

type OnContextMenuHandler = ((e: React.MouseEvent) => void) | null

const WindowManagerContext = React.createContext<models.WindowManager | null>(null)

export function WindowManager({ model, children }: WindowManagerProps): JSX.Element {
  return <WindowManagerContext.Provider value={model}>{children}</WindowManagerContext.Provider>
}

export function useContextMenu(contextMenu: models.ContextMenu | null): OnContextMenuHandler {
  const windowManager = useContext(WindowManagerContext)
  if (!contextMenu)
    return null
  return e => {
    e.preventDefault()
    windowManager?.openContextMenu(contextMenu, e.clientX, e.clientY)
  }
}
