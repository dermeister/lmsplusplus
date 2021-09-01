import React from "react"
import * as models from "../../models"
import { TaskEditorView, View } from "../../models"
import { autorender } from "../autorender"
import { MonacoEditor } from "../MonacoEditor"
import { SidePanel } from "../SidePanel"
import { SubViewBar } from "../SubViewBar"
import { ViewGroup } from "../ViewGroup"
import styles from "./TasksView.module.scss"
import { TaskEditor } from "./TaskEditor"
import { TasksExplorer } from "./TasksExplorer"

interface TasksViewProps {
  model: models.TasksView
}

function tasksView(view: models.TasksView, pulsing: boolean): JSX.Element {
  return (
    <div className={styles.viewContent}>
      <SidePanel model={view.sidePanel} pulsing={pulsing}>
        <TasksExplorer model={view} />
      </SidePanel>
      <div className={styles.mainPanel}>
        <div className={styles.description}>
          {view.explorer.selectedTask?.description ?? "No task"}
        </div>
      </div>
    </div>
  )
}

function taskEditorView(view: models.TaskEditorView, pulsing: boolean): JSX.Element {
  return (
    <div className={styles.viewContent}>
      <SidePanel model={view.sidePanel} pulsing={pulsing}>
        <TaskEditor model={view.taskEditor} />
      </SidePanel>
      <div className={styles.mainPanel}>
        <MonacoEditor model={view.taskEditor.description} />
      </div>
    </div>
  )
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  function onToggleClick(view: View): void {
    switch (view) {
      case model:
        model.sidePanel.toggle()
        break
      case model.taskEditorView:
        model.taskEditorView?.sidePanel.toggle()
        break
    }
  }

  function viewSwitch(model: models.ViewGroup): JSX.Element {
    return <SubViewBar model={model} onToggleClick={onToggleClick} />
  }

  function viewContent(viewGroup: models.ViewGroup): JSX.Element | undefined {
    switch (viewGroup.activeView) {
      case model:
        return tasksView(model, model.monitor.isActive)
      case model.taskEditorView:
        return taskEditorView(model.taskEditorView as TaskEditorView, model.monitor.isActive)
    }
  }

  return autorender(() => (
    <ViewGroup model={model.subViews} renderViewSwitch={viewSwitch} renderViewContent={viewContent} />
  ), [model])
}
