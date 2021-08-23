import React from "react"
import * as models from "../../models"
import { AppScreen } from "../AppScreen"
import { autorender } from "../autorender"
import { MonacoEditor } from "../MonacoEditor"
import { TaskEditor } from "./TaskEditor"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./TasksView.module.scss"

interface TasksViewProps {
  model: models.TasksView
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  function mainPanel(): JSX.Element {
    let content: JSX.Element
    if (model.explorer.taskEditor)
      content = <MonacoEditor model={model.explorer.taskEditor.description} />
    else
      content = (
        <div className={styles.description}>
          {model.explorer.selectedTask?.description ?? "No task"}
        </div>
      )
    return <AppScreen.MainPanel>{content}</AppScreen.MainPanel>
  }

  function rightPanel(): JSX.Element | undefined {
    if (model.explorer.taskEditor)
      return (
        <AppScreen.RightPanel model={model.rightPanel}>
          <TaskEditor model={model.explorer.taskEditor} />
        </AppScreen.RightPanel>
      )
  }

  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel} pulsing={model.monitor.isActive}>
        <TasksExplorer model={model.explorer} />
      </AppScreen.LeftPanel>

      {mainPanel()}
      {rightPanel()}
    </>
  ), [model, model.monitor])
}
