import React, { useContext } from "react";
import { Models } from "../models/";

interface WindowManagerProps {
  model: Models.WindowManager;
  children: React.ReactNode;
}

const WindowManagerContext = React.createContext<Models.WindowManager | null>(null);

export function WindowManager({ model, children }: WindowManagerProps): JSX.Element {
  return <WindowManagerContext.Provider value={model}>{children}</WindowManagerContext.Provider>;
}

export function useContextMenu(contextMenu: Models.ContextMenu): (e: React.MouseEvent) => void {
  const windowManager = useContext(WindowManagerContext);

  return (e) => {
    e.preventDefault();
    windowManager?.openContextMenu(contextMenu, e.clientX, e.clientY);
  };
}
