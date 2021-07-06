import React from "react"
import { Models } from "../../models"
import { AppScreen } from "../AppScreen"
import autorender from "../autorender"
import { TasksExplorer } from "./TasksExplorer"

interface TasksViewProps {
  model: Models.TasksView
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  const { tasksMonitor } = Models.TasksView
  return autorender(
    () => (
      <>
        <AppScreen.LeftPanel model={model.leftPanel} pulsing={tasksMonitor.isActive}>
          <TasksExplorer model={model.explorer} />
        </AppScreen.LeftPanel>

        <AppScreen.MainPanel>Tasks</AppScreen.MainPanel>
      </>
    ),
    [model, tasksMonitor]
  )
}
