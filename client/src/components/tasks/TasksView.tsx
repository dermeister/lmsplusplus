import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { MonacoEditor } from "../MonacoEditor"
import { SidePanel } from "../SidePanel"
import { SubViewBar } from "../SubViewBar"
import { ViewGroup } from "../ViewGroup"
import { DemoView } from "./DemoView"
import { TaskEditor } from "./TaskEditor"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./TasksView.module.scss"

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

function demoView(view: models.DemoView): JSX.Element {
  return <DemoView model={view} />
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  function onToggleClick(view: models.View): void {
    switch (view) {
      case model:
        model.sidePanel.toggle()
        break
      case model.taskEditorView:
        model.taskEditorView?.sidePanel.toggle()
        break
      case model.demoView:
        model.demoView?.sidePanel.toggle()
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
        return taskEditorView(model.taskEditorView as models.TaskEditorView, model.monitor.isActive)
      case model.demoView:
        return demoView(model.demoView as models.DemoView)
    }
  }

  return autorender(() => (
    <ViewGroup model={model.subViews} renderViewSwitch={viewSwitch} renderViewContent={viewContent} />
  ), [model])
}
