import React from "react"
import { Overlay } from "../Overlay"
import styles from "./ContextMenuContainer.module.scss"
import { ContextMenuService } from "./ContextMenuService"

interface ContextMenuProps {
    x: number
    y: number
    model: ContextMenuService
    contextMenu: JSX.Element | null
}

export function ContextMenuContainer({ model, contextMenu, x, y }: ContextMenuProps): JSX.Element {
    function positionMenu(menu: HTMLElement | null): void {
        if (menu) {
            const offset = 10
            if (x + menu.clientWidth + offset > window.innerWidth)
                menu.style.right = `${offset}px`
            else
                menu.style.left = `${x}px`
            if (y + menu.clientHeight + offset > window.innerHeight)
                menu.style.bottom = `${offset}px`
            else
                menu.style.top = `${y}px`
        }
    }

    return (
        <Overlay onClick={() => model.close()} trapFocus>
            <menu ref={positionMenu} onContextMenu={onContextMenu} className={styles.contextMenuContainer}>
                {contextMenu}
            </menu>
        </Overlay>
    )
}

function onContextMenu(e: React.MouseEvent): void {
    e.preventDefault()
    e.stopPropagation()
}