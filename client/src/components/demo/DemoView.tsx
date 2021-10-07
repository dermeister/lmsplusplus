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

export function DemoView({ model }: DemoViewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current)
      model.mount(ref.current)
    return () => model.unmount()
  }, [model, ref])

  return autorender(() => (
    <div className={styles.demoView}>
      <div className={styles.sidePanel}>
        <SidePanel model={model.sidePanel}>
          {sidePanelContent(model)}
        </SidePanel>
      </div>
      <div className={styles.content}>{content(model, ref)}</div>
    </div>
  ), [model, ref])
}

function sidePanelContent(model: models.DemoView): JSX.Element {
  let body
  if (model.explorer instanceof models.SingleDemoExplorer)
    body = (
      <>
        {startOrStopButton(model)}
        <DemoExplorer model={model} />
      </>
    )
  else if (model.explorer.children.length === 0)
    body = (
      <>
        <p className={styles.noDemos}>There are no services available</p>
        <Button variant="primary" onClick={() => model.close()} className={styles.closeButton}>Close</Button>
      </>
    )
  else
    body = <DemoExplorer model={model} />
  return (
    <>
      {body}
      <Button className={styles.closeButton} variant="secondary" onClick={() => model.close()}>Close</Button>
    </>
  )
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

function content(model: models.DemoView, ref: React.RefObject<HTMLDivElement>): JSX.Element {
  let body
  if (!model.explorer.selectedService)
    body = <div className={styles.serviceNotSelected}>Service is not selected</div>
  else if (!model.isDemoRunning(model.explorer.selectedService.demo))
    body = <div className={styles.demoNotRunning}>Demo is not running</div>
  else
    body = <></>
  return <div ref={ref} className={styles.container}>{body}</div>
}
