import React from "react"
import { Models } from "../../models"
import { AppScreen } from "../AppScreen"
import autorender from "../autorender"
import { TaskEditor } from "./TaskEditor"
import { TasksExplorer } from "./TasksExplorer"

interface TasksViewProps {
  model: Models.TasksView
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  function rightPanel(): JSX.Element | undefined {
    if (model.taskEditor)
      return (
        <AppScreen.RightPanel model={model.rightPanel}>
          <TaskEditor model={model.taskEditor} />
        </AppScreen.RightPanel>
      )
  }

  return autorender(
    () => (
      <>
        <AppScreen.LeftPanel model={model.leftPanel} pulsing={model.monitor.isActive}>
          <TasksExplorer model={model.explorer} />
        </AppScreen.LeftPanel>

        <AppScreen.MainPanel>Tasks</AppScreen.MainPanel>

        {rightPanel()}
      </>
    ),
    [model, model.monitor]
  )
}
