import React from "react"
import * as models from "../models"
import { View } from "../models"
import { autorender } from "./autorender"
import styles from "./SubviewSwitch.module.scss"
import { combineClassNames, maybeValue } from "./utils"

interface SubViewBarProps {
  model: models.ViewGroup
  onToggleClick?(view: View): void
}

export function SubviewSwitch({ model, onToggleClick }: SubViewBarProps): JSX.Element {
  function onClick(view: View): void {
    model.setActive(view)
    onToggleClick?.(view)
  }

  return autorender(() => (
    <div className={styles.switch}>
      {model.views.map(view => {
        const isActive = model.activeView === view
        const className = combineClassNames(styles.toggle, maybeValue(styles.active, isActive))
        return (
          <button
            onClick={() => onClick(view)}
            className={className}
            key={view.key}
          >
            <span>{view.title}</span>
          </button>
        )
      })}
    </div>
  ), [model, onToggleClick])
}