import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { DemoView } from "../demo/DemoView"
import { SidePanel } from "../SidePanel"
import { SubviewSwitch } from "../SubviewSwitch"
import { TaskEditorView } from "../task-editor/TaskEditorView"
import { TasksExplorer } from "./TasksExplorer"
import styles from "./TasksView.module.scss"
import { SolutionEditorView } from "../solution-editor/SolutionEditorView"

interface TasksViewProps {
  model: models.TasksView
}

export function TasksView({ model }: TasksViewProps): JSX.Element {
  return autorender(() => (
    <div className={styles.tasksView}>
      {viewSwitch(model)}
      {viewContent(model)}
    </div>
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
      case model.solutionEditorView:
        model.solutionEditorView?.sidePanel.toggle()
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
    case model.solutionEditorView:
      content = <SolutionEditorView model={model.solutionEditorView as models.SolutionEditorView} />
  }
  if (content)
    return <div className={styles.content}>{content}</div>
}

function tasksView(view: models.TasksView, pulsing: boolean): JSX.Element {
  return (
    <div className={styles.tasksContent}>
      <SidePanel model={view.sidePanel} pulsing={pulsing}>
        <TasksExplorer model={view} />
      </SidePanel>
      {description(view)}
    </div>
  )
}

function description(view: models.TasksView): JSX.Element {
  if (!view.descriptionHtml)
    return <p className={styles.noTask}>No task selected</p>
  return <div className={styles.description} dangerouslySetInnerHTML={{ __html: view.descriptionHtml }} />
}