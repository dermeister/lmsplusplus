import React, { useState } from "react"
import styles from "./MultiselectDropdown.module.scss"
import { Overlay } from "./Overlay"
import { combineClassNames, maybeValue } from "./utils"

export interface MultiselectDropdownItem<T> {
    value: T
    title: string
}

interface MultiselectDropdownProps<T> {
    items: readonly MultiselectDropdownItem<T>[]
    selectedValues: readonly T[]
    createPlaceholder: () => string

    onValuesChange?(values: readonly T[]): void
}

export function MultiselectDropdown<T>(props: MultiselectDropdownProps<T>): JSX.Element {
    const { selectedValues, createPlaceholder, items } = props
    const [isOpened, setIsOpened] = useState(false)

    function selectedItem(): JSX.Element {
        const combinedClassName = combineClassNames(styles.preview, maybeValue(styles.opened, isOpened))
        return (
            <div onClick={() => setIsOpened(!isOpened)} className={combinedClassName}>
                {createPlaceholder()}
            </div>
        )
    }

    function otherItems(): JSX.Element {
        return (
            <ul className={styles.items}>
                {items.map(item => {
                    const combinedClassName = combineClassNames(styles.item, maybeValue(styles.selected,
                        selectedValues?.includes(item.value) ?? false))
                    return (
                        <li key={item.title}
                            onClick={() => onChange(item.value)}
                            className={combinedClassName}>
                            {item.title}
                        </li>
                    )
                })}
            </ul>
        )
    }

    function onChange(value: T): void {
        const values = selectedValues ?? []
        let newValues: T[]
        if (!selectedValues?.includes(value))
            newValues = [...values, value]
        else
            newValues = values.filter(v => v !== value)
        props.onValuesChange?.(newValues)
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
