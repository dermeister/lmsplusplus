import React from "react"
import * as models from "../../models"
import { AppScreen } from "../AppScreen"
import { autorender } from "../autorender"
import { DemoExplorer } from "./DemoExplorer"
import { MonacoEditor } from "../MonacoEditor"
import { TaskEditor } from "./TaskEditor"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./TasksView.module.scss"

interface TasksViewProps {
  model: models.TasksView
}

function mainPanel(model: models.TasksView): JSX.Element {
  let content: JSX.Element
  if (model.tasksExplorer.taskEditor)
    content = <MonacoEditor model={model.tasksExplorer.taskEditor.description} />
  else
    content = (
      <div className={styles.description}>
        {model.tasksExplorer.selectedTask?.description ?? "No task"}
      </div>
    )
  return <AppScreen.MainPanel>{content}</AppScreen.MainPanel>
}

function rightSidePanelGroup(model: models.TasksView): JSX.Element | undefined {
  function taskEditor(): JSX.Element {
    if (!model.tasksExplorer.taskEditor)
      throw new Error("Task editor is not created")
    return <TaskEditor model={model.tasksExplorer.taskEditor} />
  }

  function demoExplorer(): JSX.Element {
    if (!model.demoExplorer)
      throw new Error("Demo explorer is not created")
    return <DemoExplorer model={model.demoExplorer} />
  }

  return <AppScreen.SidePanelGroup
    model={model.rightPanels}
    panels={{ editor: taskEditor, demo: demoExplorer }}
  />
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  function tasksExplorer(): JSX.Element {
    return <TasksExplorer model={model} />
  }

  return autorender(() => (
    <>
      <AppScreen.SidePanelGroup
        model={model.leftPanels}
        panels={{ tasks: tasksExplorer }}
        pulsing={model.monitor.isActive}
      />
      {mainPanel(model)}
      {rightSidePanelGroup(model)}
    </>
  ), [model])
}
