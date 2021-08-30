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
    if (model.explorer.taskEditor) {
      const panels = new Map([[model.rightPanel, taskEditor]])
      return <AppScreen.SidePanelGroup model={model.rightSidePanelGroup} panels={panels} />
    }
  }

  function tasksExplorer(): JSX.Element {
    return <TasksExplorer model={model} />
  }

  function taskEditor(): JSX.Element {
    if (!model.explorer.taskEditor)
      throw new Error("Task editor is not created")
    return <TaskEditor model={model.explorer.taskEditor} />
  }

  return autorender(() => {
    const panels = new Map([[model.leftPanel, tasksExplorer]])
    return (
      <>
        <AppScreen.SidePanelGroup
          model={model.leftSidePanelGroup}
          panels={panels}
          pulsing={model.monitor.isActive}
        />
        {mainPanel()}
        {rightPanel()}
      </>
    )
  }, [model, model.monitor])
}
