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
  className?: string
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
  const { selectedItemIndex, placeholder, items, className } = props
  const [isOpened, setIsOpened] = useState(false)

  function preview(): JSX.Element {
    let content = selectedItemIndex !== undefined ? items[selectedItemIndex].title : placeholder
    return <div onClick={() => setIsOpened(!isOpened)} className={styles.preview}>{content}</div>
  }

  function onChange(value: number): void {
    props.onChange?.(value)
    setIsOpened(false)
  }

  let content
  if (isOpened) {
    const itemsWithoutSelected = items
      .filter(i => selectedItemIndex === undefined || i.key !== items[selectedItemIndex].key)
    content = (
      <Overlay onClick={() => setIsOpened(false)}>
        {preview()}
        <div className={styles.relativelyPositionedContainer}>
          <ul className={styles.options}>
            {itemsWithoutSelected.map(item => (
              <li
                key={item.key}
                onClick={() => onChange(items.indexOf(item))}
                className={styles.option}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </Overlay>
    )
  } else
    content = preview()

  const combinedClassName = combineClassNames(maybeValue(styles.dropdownOpened, isOpened), className)
  return <div className={combinedClassName}>{content}</div>
}
