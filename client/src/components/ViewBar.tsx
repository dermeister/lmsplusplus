import React from "react"
import * as models from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import styles from "./ViewBar.module.scss"

interface ViewBarProps {
  model: models.App
  className?: string
}

export function ViewBar({ model, className }: ViewBarProps): JSX.Element {
  return autorender(() => (
    <div className={buildClassName(className)}>
      <div className={styles.topButtons}>
        {button(model, model.tasksView)}
        {button(model, model.solutionsView)}
        {button(model, model.demoView)}
      </div>

      <div className={styles.bottomButtons}>{button(model, model.optionsView)}</div>
    </div>
  ), [model, className])
}

function buildClassName(className?: string): string {
  let result = styles.viewBar
  if (className)
    result += ` ${className}`
  return result
}

function button(model: models.App, view: models.View): JSX.Element {
  let className = styles.viewButton
  let variant: "primary" | "secondary"
  if (model.activeView === view) {
    className += ` ${styles.selected}`
    variant = "secondary"
  } else
    variant = "primary"
  switch (view) {
    case model.tasksView:
      className += ` ${styles.tasks}`
      break
    case model.solutionsView:
      className += ` ${styles.solutions}`
      break
    case model.demoView:
      className += ` ${styles.demo}`
      break
    case model.optionsView:
      className += ` ${styles.options}`
      break
  }
  return <Button variant={variant} onClick={() => model.setActiveView(view)} className={className} />
}
