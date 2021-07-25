import React from "react"
import ReactDOM from "react-dom"
import * as models from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import styles from "./ContextMenu.module.scss"
import { Overlay } from "./Overlay"

interface ContextMenuProps {
  model: models.ContextMenu
  children: React.ReactNode
}

export function ContextMenu({ model, children }: ContextMenuProps): JSX.Element {
  function positionMenu(menu: HTMLElement | null): void {
    if (menu) {
      const offset = 10
      if (model.x + menu.clientWidth + offset > window.innerWidth)
        menu.style.right = `${offset}px`
      else
        menu.style.left = `${model.x}px`
      if (model.y + menu.clientHeight + offset > window.innerHeight)
        menu.style.bottom = `${offset}px`
      else
        menu.style.top = `${model.y}px`
    }
  }

  return autorender(() => {
    if (!model.isOpened)
      return <></>
    else
      return ReactDOM.createPortal(
        <Overlay onClick={() => model.close()}>
          <menu ref={positionMenu} onContextMenu={onContextMenu} className={styles.contextMenu}>
            {children}
          </menu>
        </Overlay>,
        document.getElementById("context-menu") as Element
      )
  }, [model, children])
}

function onContextMenu(e: React.MouseEvent): void {
  e.preventDefault()
  e.stopPropagation()
}

interface ContextMenuButtonProps {
  children?: React.ReactNode
  onClick?(): void
}

ContextMenu.Button = function ContextMenuButton(props: ContextMenuButtonProps): JSX.Element {
  return (
    <Button variant="secondary" onClick={props.onClick} tabIndex={-1} className={styles.contextMenuButton}>
      {props.children}
    </Button>
  )
}
