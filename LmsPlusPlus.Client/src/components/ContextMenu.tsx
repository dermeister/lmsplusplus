import React, { useState } from "react"
import ReactDOM from "react-dom"
import * as models from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import styles from "./ContextMenu.module.scss"
import { Overlay } from "./Overlay"
import { combineClassNames, maybeValue } from "./utils"

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
                <Overlay onClick={() => model.close()} trapFocus>
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
    variant: "primary" | "danger"
    children?: React.ReactNode

    onClick?(): void
}

ContextMenu.Button = function ContextMenuButton({ children, onClick, variant }: ContextMenuButtonProps): JSX.Element {
    return (
        <Button variant={variant}
                onClick={onClick}
                tabIndex={-1}
                className={variants[variant]}>
            {children}
        </Button>
    )
}

const variants = {
    primary: styles.primary,
    danger: styles.danger
}

interface ContextMenuSubmenuProps {
    children: React.ReactNode
    title: string
}

ContextMenu.Submenu = function ContextMenuSubmenu({ children, title }: ContextMenuSubmenuProps): JSX.Element {
    const [isOpened, setIsOpened] = useState(false)

    function items(): JSX.Element {
        if (!isOpened)
            return <></>
        return (
            <div className={styles.submenuItemsContainer}>
                <div className={styles.submenuItems}>{children}</div>
            </div>
        )
    }

    return (
        <div onMouseOver={() => setIsOpened(true)}
             onMouseLeave={() => setIsOpened(false)}
             className={styles.submenuContainer}>
            <Button variant="primary"
                    tabIndex={-1}
                    className={combineClassNames(styles.primary, maybeValue(styles.focused, isOpened))}>
                <p className={styles.submenuTitle}>{title}</p>
            </Button>
            {items()}
        </div>
    )
}
