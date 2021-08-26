import React from "react"
import * as models from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import styles from "./SidePanel.module.scss"
import { combineClassNames, maybeValue } from "./utils"

export enum Side {
  Left,
  Right,
}

interface SidePanelProps {
  model: models.SidePanel
  side: Side
  pulsing?: boolean
  panelClassName?: string
  toggleClassName?: string
  children?: React.ReactNode
}

export function SidePanel(props: SidePanelProps): JSX.Element {
  const { model, side, pulsing, panelClassName, toggleClassName, children } = props
  return autorender(() => {
    if (model.isOpened) {
      const combinedPanelClassName = combineClassNames(styles.sidePanel,
                                                       maybeValue(panelClassName, Boolean(panelClassName)))
      const combinedHeaderClassName = combineClassNames(styles.header,
                                                        maybeValue(styles.headerPulsing, Boolean(pulsing)))
      return (
        <div className={combinedPanelClassName}>
          <header className={combinedHeaderClassName}>
            <h2 className={styles.title}>{model.title}</h2>
            <button onClick={() => model.close()} className={styles.close} />
          </header>

          <div className={styles.children}>{children}</div>
        </div>
      )
    } else {
      const combinedToggleClassName = combineClassNames(styles.sidePanelToggle,
                                                        maybeValue(styles.sidePanelToggleLeft,
                                                                   side === Side.Left),
                                                        maybeValue(styles.sidePanelToggleRight,
                                                                   side === Side.Right),
                                                        maybeValue(toggleClassName, Boolean(toggleClassName)))
      return (
        <Button
          variant="secondary"
          onClick={() => model.open()}
          className={combinedToggleClassName}
        >
          {model.title}
        </Button>
      )
    }
  }, [model, side, pulsing, panelClassName, children])
}
