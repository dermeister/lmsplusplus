import React, { useEffect, useRef } from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { SidePanel } from "../SidePanel"
import { DemoExplorer } from "./DemoExplorer"
import styles from "./DemoView.module.scss"

interface DemoViewProps {
  model: models.DemoView
}

function explorer(model: models.DemoView): JSX.Element {
  if (model.explorer instanceof models.SingleDemoExplorer)
    return (
      <>
        {startOrStopButton(model)}
        <DemoExplorer model={model} />
      </>
    )
  if (model.explorer.children.length === 0)
    return (
      <>
        <p className={styles.noDemos}>There are no services available</p>
        <Button variant="primary" onClick={() => model.close()} className={styles.closeButton}>Close</Button>
      </>
    )
  return <DemoExplorer model={model} />
}

function startOrStopButton(model: models.DemoView): JSX.Element {
  const { explorer } = model
  if (!(explorer instanceof models.SingleDemoExplorer))
    throw new Error("Demo explorer must be instance of SingleDemoExplorer")
  if (model.isDemoRunning(explorer.demo))
    return (
      <Button
        variant="danger"
        onClick={() => model.stop(explorer.demo)}
        className={styles.stopButton}
      >
        Stop
      </Button>
    )
  return (
    <Button
      variant="primary"
      onClick={() => model.start(model.demos[0])}
      className={styles.startButton}
    >
      Start
    </Button>
  )
}

export function DemoView({ model }: DemoViewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const service = model.explorer?.selectedService
    if (ref.current && service)
      model.getDemoService(service).mount(service, ref.current)
    return () => {
      if (service)
        model.getDemoService(service).unmount(service)
    }
  }, [model.explorer.selectedService])

  return autorender(() => {
    model.explorer.selectedService // subscribe for changes to rerun useEffect
    return (
      <div className={styles.viewContent}>
        <SidePanel model={model.sidePanel}>
          {explorer(model)}
        </SidePanel>
        <div className={styles.mainPanel}>
          <div ref={ref} className={styles.demoContainer} />
        </div>
      </div>
    )
  }, [model])
}
