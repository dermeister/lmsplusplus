import React, { useState } from "react"
import styles from "./Dropdown.module.scss"
import { Overlay } from "./Overlay"
import { combineClassNames, maybeValue } from "./utils"

export interface DropdownItem<T> {
    value: T
    title: string
}

interface DropdownPropsBase<T> {
    items: readonly DropdownItem<T>[]

    onValueChange?(active: T): void
}

interface DropdownPropsWithSelectedItem<T> extends DropdownPropsBase<T> {
    selectedValue: T
    placeholder?: undefined
}

interface DropdownPropsWithPlaceholder<T> extends DropdownPropsBase<T> {
    selectedValue?: T
    placeholder: string
}

type DropdownProps<T> = DropdownPropsWithSelectedItem<T> | DropdownPropsWithPlaceholder<T>

export function Dropdown<T>(props: DropdownProps<T>): JSX.Element {
    const { selectedValue, placeholder, items } = props
    const [isOpened, setIsOpened] = useState(false)

    function selectedItem(): JSX.Element {
        const item = items.find(i => i.value === selectedValue)
        let content = item?.title ?? placeholder
        const combinedClassName = combineClassNames(styles.preview, maybeValue(styles.opened, isOpened))
        return (
            <div onClick={() => setIsOpened(!isOpened)} className={combinedClassName}>
                {content}
            </div>
        )
    }

    function otherItems(): JSX.Element {
        const itemsWithoutSelected = items.filter(i => selectedValue === undefined || i.value !== selectedValue)
        return (
            <ul className={styles.items}>
                {itemsWithoutSelected.map(item => (
                    <li key={item.title}
                        onClick={() => onChange(item.value)}
                        className={styles.item}>
                        {item.title}
                    </li>
                ))}
            </ul>
        )
    }

    function onChange(value: T): void {
        setIsOpened(false)
        props.onValueChange?.(value)
    }

    if (!isOpened)
        return selectedItem()
    return (
        <Overlay onClick={() => setIsOpened(false)}>
            {selectedItem()}
            <div className={styles.itemsContainer}>{otherItems()}</div>
        </Overlay>
    )
}
