import React from "react"
import * as models from "../../models"
import { TaskEditorView, View } from "../../models"
import { autorender } from "../autorender"
import { MonacoEditor } from "../MonacoEditor"
import { SidePanel } from "../SidePanel"
import { SubViewBar } from "../SubViewBar"
import { ViewGroup } from "../ViewGroup"
import { TaskEditor } from "./TaskEditor"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./MainView.module.scss"

interface TasksViewProps {
  model: models.MainView
}

function tasksView(view: models.TasksView, pulsing: boolean): JSX.Element {
  return (
    <div className={styles.viewContent}>
      <SidePanel model={view.sidePanel} pulsing={pulsing}>
        <TasksExplorer model={view} />
      </SidePanel>
      <div className={styles.mainPanel}>
        <div className={styles.description}>
          {view.tasksExplorer.selectedTask?.description ?? "No task"}
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

export function MainView({ model }: TasksViewProps): JSX.Element {
  function onToggleClick(view: View): void {
    switch (view) {
      case model.tasksView:
        model.tasksView.sidePanel.isOpened ? model.tasksView.sidePanel.close() : model.tasksView.sidePanel.open()
        break
      case model.taskEditorView:
        model.taskEditorView?.sidePanel.isOpened ? model.taskEditorView?.sidePanel.close() : model.taskEditorView?.sidePanel.open()
        break
    }
  }

  function viewSwitch(model: models.ViewGroup): JSX.Element {
    return <SubViewBar model={model} onToggleClick={onToggleClick} />
  }

  function viewContent(viewGroup: models.ViewGroup): JSX.Element | undefined {
    switch (viewGroup.activeView) {
      case model.tasksView:
        return tasksView(model.tasksView, model.monitor.isActive)
      case model.taskEditorView:
        return taskEditorView(model.taskEditorView as TaskEditorView, model.monitor.isActive)
    }
  }

  return autorender(() => (
    <ViewGroup model={model.subViews} renderViewSwitch={viewSwitch} renderViewContent={viewContent} />
  ), [model])
}
