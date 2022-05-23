import React, { useState } from "react"
import ReactDOM from "react-dom"
import * as models from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import styles from "./ContextMenu.module.scss"
import { ContextMenu } from "./ContextMenuService"
import { Overlay } from "./Overlay"
import { combineClassNames, maybeValue } from "./utils"

interface ContextMenuProps {
    model: ContextMenu
    children: React.ReactNode
}

export function ContextMenuView({ model, children }: ContextMenuProps): JSX.Element {
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
    className?: string

    onClick?(): void
}

ContextMenuView.Button = function ContextMenuButton({ children, onClick, variant, className }: ContextMenuButtonProps): JSX.Element {
    return (
        <Button variant={variant}
            onClick={onClick}
            tabIndex={-1}
            className={combineClassNames(variants[variant], className)}>
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

ContextMenuView.Submenu = function ContextMenuSubmenu({ children, title }: ContextMenuSubmenuProps): JSX.Element {
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
            <ContextMenuView.Button variant="primary"
                className={combineClassNames(styles.submenuButton, maybeValue(styles.focused, isOpened))}>
                {title}
            </ContextMenuView.Button>
            {items()}
        </div>
    )
}

export interface RadioItem<T> {
    value: T
    title: string
}

interface ContextMenuRadioGroup<T> {
    items: readonly RadioItem<T>[]
    selectedValue?: T

    onValueChange?(active: T): void
}

ContextMenuView.RadioGroup = function ContextMenuRadioGroup<T>(props: ContextMenuRadioGroup<T>): JSX.Element {
    const { items, selectedValue, onValueChange } = props

    function onClick(i: T): void {
        if (!isActive(i))
            onValueChange?.(i)
    }

    function isActive(i: T): boolean {
        return i === selectedValue
    }

    return (
        <div>
            {items.map(i => (
                <ContextMenuView.Button key={i.title}
                    variant="primary"
                    onClick={() => onClick(i.value)}
                    className={maybeValue(styles.radioButtonActive, isActive(i.value))}>
                    {i.title}
                </ContextMenuView.Button>
            ))}
        </div>
    )
}
