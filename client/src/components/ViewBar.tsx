import React from "react"
import { IconType } from "react-icons"
import { FaCode, FaCog, FaDesktop, FaTasks } from "react-icons/fa"
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
        {button(model, model.tasksView, FaTasks)}
        {button(model, model.solutionsView, FaCode)}
        {button(model, model.demoView, FaDesktop)}
      </div>

      <div className={styles.bottomButtons}>{button(model, model.optionsView, FaCog)}</div>
    </div>
  ), [model, className])
}

function buildClassName(className?: string): string {
  let result = styles.viewBar
  if (className)
    result += ` ${className}`
  return result
}

function button(model: models.App, view: models.View, Icon: IconType): JSX.Element {
  let className = styles.viewButton
  let variant: "primary" | "secondary"
  if (model.activeView === view) {
    className += ` ${styles.selected}`
    variant = "secondary"
  } else
    variant = "primary"

  return (
    <Button variant={variant} onClick={() => model.setActiveView(view)} className={className}>
      <Icon size={20} />
    </Button>
  )
}
