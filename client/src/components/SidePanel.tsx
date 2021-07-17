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
  panelClassName?: string
  toggleClassName?: string
  children?: React.ReactNode
}

export function SidePanel(props: SidePanelProps): JSX.Element {
  const { model, side, pulsing, panelClassName, toggleClassName, children } = props
  return autorender(() => {
    if (model.opened)
      return (
        <div className={buildPanelClassName(panelClassName)}>
          <header className={buildHeaderClassName(pulsing)}>
            <h2 className={styles.title}>{model.title}</h2>
            <button onClick={() => model.close()} className={styles.close}><FaTimes /></button>
          </header>

          {children}
        </div>
      )
    return (
      <Button
        variant="secondary"
        className={buildToggleClassName(side, toggleClassName)}
        onClick={() => model.open()}
      >
        {model.title}
      </Button>
    )
  }, [model, side, pulsing, panelClassName, children])
}

function buildPanelClassName(className?: string): string {
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

function buildToggleClassName(position: Side, className?: string): string {
  let result = styles.sidePanelToggle
  switch (position) {
    case Side.Left:
      result += ` ${styles.sidePanelToggleLeft}`
      break
    case Side.Right:
      result += ` ${styles.sidePanelToggleRight}`
      break
  }
  if (className)
    result += ` ${className}`
  return result
}
