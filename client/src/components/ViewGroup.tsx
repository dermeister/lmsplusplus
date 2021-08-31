import React from "react"
import * as models from "../models"
import { autorender } from "./autorender"
import styles from "./ViewGroup.module.scss"

interface ViewGroupProps {
  model: models.ViewGroup
  renderViewSwitch(model: models.ViewGroup): React.ReactNode
  renderViewContent(model: models.ViewGroup): React.ReactNode
}

export function ViewGroup({ model, renderViewSwitch, renderViewContent }: ViewGroupProps): JSX.Element {
  return autorender(() => (
    <div className={styles.viewGroup}>
      <div className={styles.viewSwitchContainer}>{renderViewSwitch(model)}</div>
      <div className={styles.viewContentContainer}>{renderViewContent(model)}</div>
    </div>
  ), [model, renderViewSwitch, renderViewContent])
}
