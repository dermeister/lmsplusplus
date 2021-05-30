import React from "react";
import ReactDOM from "react-dom";
import { Models } from "../models";
import autorender from "./autorender";
import styles from "./ContextMenu.module.css";

interface ContextMenuProps {
  model: Models.ContextMenu;
  children: React.ReactNode;
}

export function ContextMenu({ model, children }: ContextMenuProps): JSX.Element {
  function onMenuMouseDown(e: React.MouseEvent): void {
    e.stopPropagation();
  }

  return autorender(() => {
    if (!model.isOpened) return <></>;

    const menuStyle = { left: model.x, top: model.y };
    return ReactDOM.createPortal(
      <div onMouseDown={() => model.close()} className={styles.overlay}>
        <menu onMouseDown={onMenuMouseDown} className={styles.contextMenu} style={menuStyle}>
          {children}
        </menu>
      </div>,
      document.getElementById("context-menu") as HTMLElement
    );
  });
}
