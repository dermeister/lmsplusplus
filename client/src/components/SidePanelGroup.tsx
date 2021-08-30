import React from "react"
import * as models from "../models"
import { autorender } from "./autorender"
import styles from "./SidePanelGroup.module.scss"
import { combineClassNames, maybeValue } from "./utils"

const sidePanelGroupClasses = {
  [models.Side.Left]: styles.sidePanelGroupLeft,
  [models.Side.Right]: styles.sidePanelGroupRight,
}

interface SidePanelGroupProps {
  model: models.PanelGroup
  pulsing?: boolean
  children(panel: string): React.ReactNode
}

export function SidePanelGroup({ model, pulsing, children }: SidePanelGroupProps): JSX.Element {
  function panel(): JSX.Element | undefined {
    if (model.isOpened && model.activePanel) {
      const combinedPanelClassName = combineClassNames(styles.sidePanel)
      const combinedHeaderClassName = combineClassNames(styles.header,
                                                        maybeValue(styles.headerPulsing, Boolean(pulsing)))
      return (
        <div className={combinedPanelClassName}>
          <header className={combinedHeaderClassName}>
            <h2 className={styles.title}>{model.activePanel}</h2>
          </header>
          <div className={styles.panelContent}>{children(model.activePanel)}</div>
        </div>
      )
    }
  }

  function toggles(): JSX.Element[] {
    return model.panels.map(panel => {
      const isActive = model.activePanel === panel && model.isOpened
      const className = combineClassNames(styles.toggle, maybeValue(styles.toggleActive, isActive))
      return (
        <button
          onClick={() => model.togglePanel(panel)}
          className={className}
          key={panel}
        >
          <span>{panel}</span>
        </button>
      )
    })
  }

  return autorender(() => (
    <div className={combineClassNames(styles.sidePanelGroup, sidePanelGroupClasses[model.side])}>
      <div className={combineClassNames(styles.toggles)}>{toggles()}</div>
      {panel()}
    </div>
  ), [model, pulsing, children])
}
