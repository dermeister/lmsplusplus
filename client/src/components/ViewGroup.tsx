import React from "react"
import * as models from "../models"
import { autorender } from "./autorender"
import styles from "./ViewGroup.module.scss"

interface ViewGroupProps {
  model: models.ViewGroup
  renderViewSwitch(): React.ReactNode
  renderViewContent(): React.ReactNode
}

export function ViewGroup({ model, renderViewSwitch, renderViewContent }: ViewGroupProps): JSX.Element {
  return autorender(() => (
    <div className={styles.viewGroup}>
      <div className={styles.viewSwitchContainer}>{renderViewSwitch()}</div>
      <div className={styles.viewContentContainer}>{renderViewContent()}</div>
    </div>
  ), [model, renderViewSwitch, renderViewContent])
}
