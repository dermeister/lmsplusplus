import React from "react"
import * as models from "../../models"
import { AppScreen } from "../AppScreen"
import { autorender } from "../autorender"

interface DemoViewProps {
  model: models.DemoView
}

export function DemoView({ model }: DemoViewProps): JSX.Element {
  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel}>Left</AppScreen.LeftPanel>
      <AppScreen.MainPanel>Demo</AppScreen.MainPanel>
    </>
  ), [model])
}
