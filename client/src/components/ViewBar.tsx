import React from "react"
import { IconType } from "react-icons"
import { FaCode, FaCog, FaDesktop, FaTasks } from "react-icons/fa"
import { Models } from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import styles from "./ViewBar.module.scss"

interface ViewBarProps {
  model: Models.Views
  className?: string
}

export function ViewBar({ model, className }: ViewBarProps): JSX.Element {
  return autorender(() => (
    <div className={buildClassName(className)}>
      <div className={styles.topButtons}>
        {button(model, model.tasks, FaTasks)}
        {button(model, model.solutions, FaCode)}
        {button(model, model.demo, FaDesktop)}
      </div>

      <div className={styles.bottomButtons}>{button(model, model.options, FaCog)}</div>
    </div>
  ), [model, className])
}

function buildClassName(className?: string): string {
  let result = styles.viewBar
  if (className)
    result += ` ${className}`
  return result
}

function button(model: Models.Views, view: Models.View, Icon: IconType): JSX.Element {
  let className = styles.viewButton
  let variant: "primary" | "secondary"
  if (model.active === view) {
    className += ` ${styles.selected}`
    variant = "secondary"
  } else
    variant = "primary"

  return (
    <Button variant={variant} onClick={() => model.activate(view)} className={className}>
      <Icon size={20} />
    </Button>
  )
}
