import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { DemoView } from "../demo/DemoView"
import { SidePanel } from "../SidePanel"
import { SubviewSwitch } from "../SubviewSwitch"
import { TaskEditorView } from "../task-editor/TaskEditorView"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./TasksView.module.scss"

interface TasksViewProps {
  model: models.TasksView
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  return autorender(() => (
    <section className={styles.tasksView}>
      {viewSwitch(model)}
      {viewContent(model)}
    </section>
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

  return (
    <div className={styles.subviewSwitch}>
      <SubviewSwitch
        model={model.viewGroup}
        onToggleClick={onToggleClick}
      />
    </div>
  )
}

function viewContent(model: models.TasksView): JSX.Element | undefined {
  let content
  switch (model.viewGroup.activeView) {
    case model:
      content = tasksView(model, model.monitor.isActive)
      break
    case model.taskEditorView:
      content = <TaskEditorView model={model.taskEditorView as models.TaskEditorView} />
      break
    case model.demoView:
      content = <DemoView model={model.demoView as models.DemoView} />
      break
  }
  if (content)
    return <div className={styles.content}>{content}</div>
}

function tasksView(view: models.TasksView, pulsing: boolean): JSX.Element {
  return (
    <section className={styles.tasksContent}>
      <SidePanel model={view.sidePanel} pulsing={pulsing}>
        <TasksExplorer model={view} />
      </SidePanel>
      <div className={styles.description}>
        {view.explorer.selectedTask?.description ?? "No task"}
      </div>
    </section>
  )
}
