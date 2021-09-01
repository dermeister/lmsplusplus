import React, { useEffect, useRef } from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { SidePanel } from "../SidePanel"
import { DemoExplorer } from "./DemoExplorer"
import styles from "./DemoView.module.scss"

interface DemoViewProps {
  model: models.DemoView
}

export function DemoView({ model }: DemoViewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const service = model.explorer.selectedService
    if (ref.current && service)
      model.demoService.mount(service, ref.current)
    return () => {
      if (service)
        model.demoService.unmount(service)
    }
  }, [model.explorer.selectedService])

  return autorender(() => {
    model.explorer.selectedService // subscribe for changes to rerun useEffect
    return (
      <div className={styles.viewContent}>
        <SidePanel model={model.sidePanel}>
          <DemoExplorer model={model} />
        </SidePanel>
        <div className={styles.mainPanel}>
          <div ref={ref} className={styles.terminalContainer} />
        </div>
      </div>
    )
  }, [model])
}
