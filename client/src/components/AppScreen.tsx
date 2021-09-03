import React from "react"
import * as models from "../models"
import { View } from "../models"
import styles from "./AppScreen.module.scss"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { OptionsView } from "./options/OptionsView"
import { TasksView } from "./tasks/TasksView"
import { combineClassNames, maybeValue } from "./utils"
import { ViewGroup } from "./ViewGroup"

interface AppScreenProps {
  model: models.App
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  return autorender(() => (
    <ViewGroup
      model={model.views}
      renderViewSwitch={() => viewSwitch(model)}
      renderViewContent={() => viewContent(model)}
    />
  ), [model])
}

function viewSwitch(model: models.App): JSX.Element {
  return (
    <div className={styles.viewBar}>
      {button(model, model.tasksView)}
      {button(model, model.optionsView)}
    </div>
  )
}

function button(model: models.App, view: View): JSX.Element {
  const className = combineClassNames(styles.viewButton,
                                      getViewToggleClassName(model, view),
                                      maybeValue(styles.selected, model.views.activeView === view))
  return (
    <Button
      variant={model.views.activeView === view ? "primary" : "secondary"}
      onClick={() => model.views.setActive(view)}
      className={className}
    />
  )
}

function getViewToggleClassName(model: models.App, view: View): string | undefined {
  switch (view) {
    case model.tasksView:
      return styles.tasks
    case model.optionsView:
      return styles.options
  }
}

function viewContent(model: models.App): JSX.Element {
  switch (model.views.activeView) {
    case model.tasksView:
      return <TasksView model={model.tasksView} />
    case model.optionsView:
      return <OptionsView model={model.optionsView} />
    default:
      throw new Error("Invalid view")
  }
}
