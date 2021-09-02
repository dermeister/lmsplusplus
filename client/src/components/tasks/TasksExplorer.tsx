import React from "react"
import { Task } from "../../domain/Task"
import * as models from "../../models"
import { autorender } from "../autorender"
import { ContextMenu } from "../ContextMenu"
import { Explorer } from "../explorer"

interface TasksExplorerProps {
  model: models.TasksView
}

export function TasksExplorer({ model }: TasksExplorerProps): JSX.Element {
  return autorender(() => (
    <Explorer model={model.explorer}>{courses(model, model.explorer.children)}</Explorer>
  ), [model])
}

function onOpenDemos(model: models.TasksView, task: models.ItemNode<Task>): void {
  task.contextMenu?.close()
  model.openDemos(task.item)
}

function onCreateTask(model: models.TasksView, course: models.CourseNode): void {
  course.contextMenu?.close()
  model.createTask(course.item)
}

function onEditTask(model: models.TasksView, task: models.ItemNode<Task>): void {
  task.contextMenu?.close()
  model.updateTask(task.item)
}

function onDeleteTask(model: models.TasksView, task: models.ItemNode<Task>): void {
  task.contextMenu?.close()
  model.deleteTask(task.item)
}

function courses(model: models.TasksView, courses: readonly models.CourseNode[]): JSX.Element[] {
  return courses.map(course => {
    let contextMenu
    if (course.contextMenu)
      contextMenu = (
        <ContextMenu model={course.contextMenu}>
          <ContextMenu.Button onClick={() => onCreateTask(model, course)}>New Task</ContextMenu.Button>
        </ContextMenu>
      )
    return (
      <li key={course.key}>
        <Explorer.Group group={course}>
          {course.title}
          {contextMenu}
        </Explorer.Group>
        <Explorer.Children group={course}>{tasks(model, course.children)}</Explorer.Children>
      </li>
    )
  })
}

function tasks(model: models.TasksView, tasks: readonly models.ItemNode<Task>[]): JSX.Element[] {
  return tasks.map(task => {
    let contextMenu
    if (task.contextMenu)
      contextMenu = (
        <ContextMenu model={task.contextMenu}>
          <ContextMenu.Button onClick={() => onOpenDemos(model, task)}>Open Demo</ContextMenu.Button>
          <ContextMenu.Button onClick={() => onEditTask(model, task)}>Edit Task</ContextMenu.Button>
          <ContextMenu.Button onClick={() => onDeleteTask(model, task)}>Delete Task</ContextMenu.Button>
        </ContextMenu>
      )
    return (
      <Explorer.Item key={task.key} item={task}>
        {task.title}
        {contextMenu}
      </Explorer.Item>
    )
  })
}
