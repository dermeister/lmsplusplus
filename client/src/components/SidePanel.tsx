import React from "react"
import { FaTimes } from "react-icons/fa"
import { Models } from "../models"
import autorender from "./autorender"
import styles from "./SidePanel.module.css"

export enum Side {
  Left,
  Right,
}

interface SidePanelProps {
  model: Models.SidePanel
  side: Side
  pulsing: boolean
  children?: React.ReactNode
}

export function SidePanel({ model, side, pulsing, children }: SidePanelProps): JSX.Element {
  return autorender(() => {
    if (model.opened) {
      return (
        <div className={styles.sidePanel}>
          <header className={buildHeaderClassName(pulsing)}>
            <h2 className={styles.title}>{model.title}</h2>
            <button onClick={() => model.close()} className={styles.close}>
              <FaTimes />
            </button>
          </header>

          {children}
        </div>
      )
    }

    return (
      <button onClick={() => model.open()} className={buildToggleClassName(side)}>
        {model.title}
      </button>
    )
  }, [model, side, pulsing, children])
}

function buildHeaderClassName(pulsing: boolean): string {
  let className = styles.header
  if (pulsing) className += ` ${styles.headerPulsing}`

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
