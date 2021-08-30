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

  return <AppScreen.SidePanelGroup model={model.rightPanels}>
    {panel => {
      switch (panel) {
        case "editor":
          return taskEditor()
        case "demo":
          return demoExplorer()
      }
    }}
  </AppScreen.SidePanelGroup>
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  function tasksExplorer(): JSX.Element {
    return <TasksExplorer model={model} />
  }

  return autorender(() => (
    <>
      <AppScreen.SidePanelGroup model={model.leftPanels} pulsing={model.monitor.isActive}>
        {panel => {
          if (panel === "tasks")
            return tasksExplorer()
        }}
      </AppScreen.SidePanelGroup>
      {mainPanel(model)}
      {rightSidePanelGroup(model)}
    </>
  ), [model])
}
