import React from "react"
import * as models from "../models"
import { View } from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { combineClassNames, maybeValue } from "./utils"
import styles from "./ViewBar.module.scss"

interface ViewBarProps {
  model: models.App
  className?: string
}

export function ViewBar({ model, className }: ViewBarProps): JSX.Element {
  return autorender(() => (
    <div className={combineClassNames(styles.viewBar, className)}>
      {button(model, model.tasksView)}
      {button(model, model.optionsView)}
    </div>
  ), [model, className])
}

function button(model: models.App, view: models.View): JSX.Element {
  const viewStylesIterable = [[model.tasksView, styles.tasks], [model.optionsView, styles.options]]
  const viewStyles = new Map<View, string>(viewStylesIterable as [View, string][])
  const className = combineClassNames(styles.viewButton,
                                      viewStyles.get(view),
                                      maybeValue(styles.selected, model.activeView === view))
  const variant = model.activeView === view ? "primary" : "secondary"
  return <Button variant={variant} onClick={() => model.setActiveView(view)} className={className} />
}
