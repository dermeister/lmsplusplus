import React from "react"
import * as models from "../../models"
import { AppScreen } from "../AppScreen"
import { autorender } from "../autorender"

interface OptionsViewProps {
  model: models.OptionsView
}

export function OptionsView({ model }: OptionsViewProps): JSX.Element {
  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel}>Left</AppScreen.LeftPanel>
      <AppScreen.MainPanel>Options</AppScreen.MainPanel>
    </>
  ), [model])
}
