import React from "react"
import { Overlay } from "../Overlay"
import { ContextMenu } from "./ContextMenu"
import styles from "./ContextMenuContainer.module.scss"
import { ContextMenuService } from "./ContextMenuService"

interface ContextMenuProps {
    x: number
    y: number
    contextMenuService: ContextMenuService
    contextMenuItems: JSX.Element[] | null
}

export function ContextMenuContainer({ contextMenuService, contextMenuItems, x, y }: ContextMenuProps): JSX.Element {
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

    function onContextMenu(e: React.MouseEvent): void {
        e.preventDefault()
        e.stopPropagation()
    }

    return (
        <Overlay onClick={() => contextMenuService.close()} trapFocus>
            <menu ref={positionMenu} onContextMenu={onContextMenu} className={styles.contextMenuContainer}>
                <ContextMenu>
                    {contextMenuItems}
                </ContextMenu>
            </menu>
        </Overlay>
    )
}

