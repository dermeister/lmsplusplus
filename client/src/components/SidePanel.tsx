import React from "react"
import { FaTimes } from "react-icons/fa"
import { Models } from "../models"
import autorender from "./autorender"
import { Button } from "./Button"
import styles from "./SidePanel.module.scss"

export enum Side {
  Left,
  Right,
}

interface SidePanelProps {
  model: Models.SidePanel
  side: Side
  pulsing?: boolean
  className?: string
  children?: React.ReactNode
}

export function SidePanel({ model, side, pulsing, className, children }: SidePanelProps): JSX.Element {
  return autorender(() => {
    if (model.opened)
      return (
        <div className={buildSidePanelClassName(className)}>
          <header className={buildHeaderClassName(pulsing)}>
            <h2 className={styles.title}>{model.title}</h2>
            <button onClick={() => model.close()} className={styles.close}><FaTimes /></button>
          </header>

          {children}
        </div>
      )
    return (
      <Button variant="secondary" className={buildToggleClassName(side)} onClick={() => model.open()}>
        {model.title}
      </Button>
    )
  }, [model, side, pulsing, className, children])
}

function buildSidePanelClassName(className?: string): string {
  let result = styles.sidePanel
  if (className)
    result += ` ${className}`
  return result
}

function buildHeaderClassName(pulsing?: boolean): string {
  let className = styles.header
  if (pulsing)
    className += ` ${styles.headerPulsing}`
  return className
}

function buildToggleClassName(position: Side): string {
  let className = styles.sidePanelToggle
  switch (position) {
    case Side.Left:
      className += ` ${styles.sidePanelToggleLeft}`
      break
    case Side.Right:
      className += ` ${styles.sidePanelToggleRight}`
      break
  }
  return className
}
