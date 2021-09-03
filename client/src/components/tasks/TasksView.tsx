import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { DemoView } from "../demo/DemoView"
import { SidePanel } from "../SidePanel"
import { SubViewBar } from "../SubViewBar"
import { TaskEditorView } from "../task-editor/TaskEditorView"
import { ViewGroup } from "../ViewGroup"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./TasksView.module.scss"

interface TasksViewProps {
  model: models.TasksView
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  return autorender(() => (
    <ViewGroup
      model={model.subViews}
      renderViewSwitch={() => viewSwitch(model)}
      renderViewContent={() => viewContent(model)}
    />
  ), [model])
}

function viewSwitch(model: models.TasksView): JSX.Element {
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

  return <SubViewBar model={model.subViews} onToggleClick={onToggleClick} />
}

function viewContent(model: models.TasksView): JSX.Element | undefined {
  switch (model.subViews.activeView) {
    case model:
      return tasksView(model, model.monitor.isActive)
    case model.taskEditorView:
      return <TaskEditorView model={model.taskEditorView as models.TaskEditorView} />
    case model.demoView:
      return <DemoView model={model.demoView as models.DemoView} />
  }
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
