import React from "react"
import { Models } from "../../models"
import { AppScreen } from "../AppScreen"
import autorender from "../autorender"
import { MonacoEditor } from "../MonacoEditor"
import { TaskEditor } from "./TaskEditor"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./TasksView.module.scss"

interface TasksViewProps {
  model: Models.TasksView
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  function mainPanel(): JSX.Element {
    let content: JSX.Element
    if (model.taskEditor)
      content = <MonacoEditor model={model.taskEditor.description} />
    else
      content = (
        <div className={styles.description}>
          {model.selectedTask?.description ?? "No task"}
        </div>
      )
    return <AppScreen.MainPanel>{content}</AppScreen.MainPanel>
  }

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

        {mainPanel()}
        {rightPanel()}
      </>
    ),
    [model, model.monitor]
  )
}
