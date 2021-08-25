import React, { useState } from "react"
import styles from "./Dropdown.module.scss"
import { Overlay } from "./Overlay"
import { FaChevronDown } from "react-icons/fa"

interface DropdownProps {
  active: string
  options: string[]
  className?: string
  onChange?(active: string): void
}

export function Dropdown(props: DropdownProps): JSX.Element {
  const { active, options, className } = props
  const [isOpened, setIsOpened] = useState(false)

  function preview(): JSX.Element {
    return (
      <div onClick={() => setIsOpened(!isOpened)} className={styles.preview}>
        {active}
        <FaChevronDown size={10} className={styles.arrow} />
      </div>
    )
  }

  function onChange(option: string): void {
    props.onChange?.(option)
    setIsOpened(false)
  }

  let content
  if (isOpened)
    content = (
      <Overlay onClick={() => setIsOpened(false)}>
        {preview()}
        <div className={styles.relativelyPositionedContainer}>
          <ul className={styles.options}>
            {options.filter(o => o !== active).map(o => (
              <li key={o} onClick={() => onChange(o)} className={styles.option}>{o}</li>
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
