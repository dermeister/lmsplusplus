import React from "react"
import * as domain from "../../domain"
import * as models from "../../models"
import { autorender } from "../autorender"
import { ContextMenu } from "../ContextMenu"
import { Explorer } from "../explorer"
import { usePermissions } from "../permissions"

interface TasksExplorerProps {
  model: models.TasksView
}

export function TasksExplorer({ model }: TasksExplorerProps): JSX.Element {
  const permissions = usePermissions()

  return autorender(() => (
    <Explorer model={model.explorer}>{courses(model, model.explorer.children, permissions)}</Explorer>
  ), [model, permissions])
}

function onOpenDemos(model: models.TasksView, task: models.ItemNode<domain.Task>): void {
  task.contextMenu?.close()
  model.openDemos(task.item)
}

function onCreateTask(model: models.TasksView, course: models.CourseNode): void {
  course.contextMenu?.close()
  model.createTask(course.item)
}

function onUpdate(model: models.TasksView, task: models.ItemNode<domain.Task>): void {
  task.contextMenu?.close()
  model.updateTask(task.item)
}

function onDeleteTask(model: models.TasksView, task: models.ItemNode<domain.Task>): void {
  task.contextMenu?.close()
  model.deleteTask(task.item)
}

function courses(model: models.TasksView,
                 courses: readonly models.CourseNode[],
                 permissions: domain.Permissions): JSX.Element[] {
  return courses.map(course => {
    let contextMenu
    if (permissions.canCreateTask)
      contextMenu = (
        <ContextMenu model={course.contextMenu}>
          <ContextMenu.Button onClick={() => onCreateTask(model, course)}>New Task</ContextMenu.Button>
        </ContextMenu>
      )
    return (
      <li key={course.key}>
        <Explorer.Group group={course} contextMenu={contextMenu}>{course.title}</Explorer.Group>
        <Explorer.Children group={course}>{tasks(model, course.children, permissions)}</Explorer.Children>
      </li>
    )
  })
}

function tasks(model: models.TasksView,
               tasks: readonly models.ItemNode<domain.Task>[],
               permissions: domain.Permissions): JSX.Element[] {
  return tasks.map(task => {
    let contextMenuBody = (
      <>
        <ContextMenu.Button onClick={() => onOpenDemos(model, task)}>Open Demo</ContextMenu.Button>
      </>
    )
    if (permissions.canUpdateTask)
      contextMenuBody = (
        <>
          {contextMenuBody}
          <ContextMenu.Button onClick={() => onUpdate(model, task)}>Edit Task</ContextMenu.Button>
        </>
      )
    if (permissions.canDeleteTask)
      contextMenuBody = (
        <>
          {contextMenuBody}
          <ContextMenu.Button onClick={() => onDeleteTask(model, task)}>Delete Task</ContextMenu.Button>
        </>
      )
    const contextMenu = (
      <ContextMenu model={task.contextMenu}>
        {contextMenuBody}
      </ContextMenu>
    )
    return <Explorer.Item key={task.key} item={task} contextMenu={contextMenu}>{task.title}</Explorer.Item>
  })
}
