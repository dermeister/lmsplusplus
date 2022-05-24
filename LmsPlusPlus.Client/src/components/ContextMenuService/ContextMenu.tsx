import React, { useState } from "react"
import { Button } from "../Button"
import { combineClassNames, maybeValue } from "../utils"
import styles from "./ContextMenu.module.scss"

interface ContextMenuProps {
    children: React.ReactNode
}

export function ContextMenu({ children }: ContextMenuProps): JSX.Element {
    return <>{children}</>
}

interface ContextMenuButtonProps {
    variant: "primary" | "danger"
    children?: React.ReactNode
    className?: string

    onClick?(): void
}

ContextMenu.Button = function ContextMenuButton({ children, onClick, variant, className }: ContextMenuButtonProps): JSX.Element {
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
            <ContextMenu.Button variant="primary"
                className={combineClassNames(styles.submenuButton, maybeValue(styles.focused, isOpened))}>
                {title}
            </ContextMenu.Button>
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

ContextMenu.RadioGroup = function ContextMenuRadioGroup<T>(props: ContextMenuRadioGroup<T>): JSX.Element {
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
                <ContextMenu.Button key={i.title}
                    variant="primary"
                    onClick={() => onClick(i.value)}
                    className={maybeValue(styles.radioButtonActive, isActive(i.value))}>
                    {i.title}
                </ContextMenu.Button>
            ))}
        </div>
    )
}
