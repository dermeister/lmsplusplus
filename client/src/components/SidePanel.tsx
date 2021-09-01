import React from "react"
import * as models from "../models"
import { autorender } from "./autorender"
import styles from "./SidePanel.module.scss"
import { combineClassNames, maybeValue } from "./utils"

interface SidePanelProps {
  model: models.SidePanel
  pulsing?: boolean
  children?: React.ReactNode
}

export function SidePanel({ model, pulsing, children }: SidePanelProps): JSX.Element {
  return autorender(() => {
    if (!model.isOpened)
      return <></>
    const combinedHeaderClassName = combineClassNames(styles.header,
                                                      maybeValue(styles.headerPulsing, Boolean(pulsing)))
    return (
      <div className={styles.sidePanel}>
        <header className={combinedHeaderClassName}>
          <h2 className={styles.title}>{model.title}</h2>
        </header>
        <div className={styles.children}>{children}</div>
      </div>
    )
  }, [model, pulsing, children])
}
