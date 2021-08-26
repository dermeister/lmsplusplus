import React, { useState } from "react"
import styles from "./Dropdown.module.scss"
import { Overlay } from "./Overlay"

export interface DropdownItem<T> {
  value: T
  title: string
  key: number
}

interface DropdownProps<T> {
  selectedItem: DropdownItem<T>
  items: DropdownItem<T>[]
  className?: string
  onChange?(active: T): void
}

export function Dropdown<T>(props: DropdownProps<T>): JSX.Element {
  const { selectedItem, items, className } = props
  const [isOpened, setIsOpened] = useState(false)

  function preview(): JSX.Element {
    return <div onClick={() => setIsOpened(!isOpened)} className={styles.preview}>{selectedItem.title}</div>
  }

  function onChange(value: T): void {
    props.onChange?.(value)
    setIsOpened(false)
  }

  let content
  if (isOpened)
    content = (
      <Overlay onClick={() => setIsOpened(false)}>
        {preview()}
        <div className={styles.relativelyPositionedContainer}>
          <ul className={styles.options}>
            {items.filter(o => o.value !== selectedItem.value).map(o => (
              <li key={o.key} onClick={() => onChange(o.value)} className={styles.option}>{o.title}</li>
            ))}
          </ul>
        </div>
      </Overlay>
    )
  else
    content = preview()
  return <div className={buildDropdownClassName(isOpened, className)}>{content}</div>
}

function buildDropdownClassName(isOpened: boolean, className?: string): string {
  let result = ""
  if (isOpened)
    result += ` ${styles.dropdownOpened}`
  if (className)
    result += ` ${className}`
  return result
}
