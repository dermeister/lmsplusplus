import React from "react"
import * as models from "../../models"
import { AppScreen } from "../AppScreen"
import { autorender } from "../autorender"
import { DemoExplorer } from "./DemoExplorer"

interface DemoViewProps {
  model: models.DemoView
}

export function DemoView({ model }: DemoViewProps): JSX.Element {
  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel}>{leftPanelContent(model)}</AppScreen.LeftPanel>
      <AppScreen.MainPanel>{mainPanelContent(model)}</AppScreen.MainPanel>
    </>
  ), [model])
}

function leftPanelContent(demo: models.DemoView): JSX.Element {
  if (!demo.isTaskOpened)
    return <div>Please, open task</div>
  return <DemoExplorer model={demo.explorer} />
}

function mainPanelContent(demo: models.DemoView): JSX.Element {
  if (!demo.explorer.selectedService)
    return <div>No service</div>
  return <div>{demo.explorer.selectedService.name}</div>
}
