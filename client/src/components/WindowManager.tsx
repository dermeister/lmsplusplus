import React, { useContext } from "react";

import { ContextMenuModel } from "../models/ContextMenuModel";
import { WindowManagerModel } from "../models/WindowManager";

interface WindowManagerProps {
  model: WindowManagerModel;
  children: React.ReactNode;
}

const WindowManagerContext = React.createContext<WindowManagerModel | null>(null);

export function WindowManager({ model, children }: WindowManagerProps): JSX.Element {
  return <WindowManagerContext.Provider value={model}>{children}</WindowManagerContext.Provider>;
}

export function useContextMenu(contextMenu: ContextMenuModel): (e: React.MouseEvent) => void {
  const windowManager = useContext(WindowManagerContext);

  return (e) => {
    e.preventDefault();
    windowManager?.openContextMenu(contextMenu, e.clientX, e.clientY);
  };
}
