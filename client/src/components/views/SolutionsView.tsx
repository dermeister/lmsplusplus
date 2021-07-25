import React from "react"
import * as models from "../../models"
import { AppScreen } from "../AppScreen"
import { autorender } from "../autorender"

interface SolutionsViewProps {
  model: models.SolutionsView
}

export function SolutionsView({ model }: SolutionsViewProps): JSX.Element {
  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel}>Left</AppScreen.LeftPanel>
      <AppScreen.MainPanel>Solutions</AppScreen.MainPanel>
    </>
  ), [model])
}
