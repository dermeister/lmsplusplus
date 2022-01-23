import React, { useState } from "react"
import styles from "./Dropdown.module.scss"
import { Overlay } from "./Overlay"
import { combineClassNames, maybeValue } from "./utils"

export interface DropdownItem<T> {
    value: T
    title: string
    key: number
}

interface DropdownPropsBase<T> {
    items: DropdownItem<T>[]

    onChange?(active: number): void
}

interface DropdownPropsWithSelectedItem<T> extends DropdownPropsBase<T> {
    selectedItemIndex: number
    placeholder?: undefined
}

interface DropdownPropsWithPlaceholder<T> extends DropdownPropsBase<T> {
    selectedItemIndex?: undefined
    placeholder: string
}

type DropdownProps<T> = DropdownPropsWithSelectedItem<T> | DropdownPropsWithPlaceholder<T>

export function Dropdown<T>(props: DropdownProps<T>): JSX.Element {
    const { selectedItemIndex, placeholder, items } = props
    const [isOpened, setIsOpened] = useState(false)

    function selectedItem(): JSX.Element {
        let content = selectedItemIndex !== undefined ? items[selectedItemIndex].title : placeholder
        const combinedClassName = combineClassNames(styles.preview, maybeValue(styles.opened, isOpened))
        return (
            <div onClick={() => setIsOpened(!isOpened)} className={combinedClassName}>
                {content}
            </div>
        )
    }

    function otherItems(): JSX.Element {
        const itemsWithoutSelected = items
            .filter(i => selectedItemIndex === undefined || i.key !== items[selectedItemIndex].key)
        return (
            <ul className={styles.items}>
                {itemsWithoutSelected.map(item => (
                    <li key={item.key}
                        onClick={() => onChange(items.indexOf(item))}
                        className={styles.item}>
                        {item.title}
                    </li>
                ))}
            </ul>
        )
    }

    function onChange(value: number): void {
        props.onChange?.(value)
        setIsOpened(false)
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
