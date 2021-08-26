import React from "react"
import { Task } from "../../domain/Task"
import * as models from "../../models"
import { autorender } from "../autorender"
import { ContextMenu } from "../ContextMenu"
import { Explorer } from "../explorer"

interface TasksExplorerProps {
  model: models.TasksExplorer
}

export function TasksExplorer({ model }: TasksExplorerProps): JSX.Element {
  return autorender(() => (
    <Explorer model={model}>{courses(model, model.children)}</Explorer>
  ), [model])
}

function onCreateTask(explorer: models.TasksExplorer, course: models.CourseNode): void {
  course.contextMenu?.close()
  explorer.createTask(course.item)
}

function onEditTask(explorer: models.TasksExplorer, task: models.ItemNode<Task>): void {
  task.contextMenu?.close()
  explorer.updateTask(task.item)
}

function onDeleteTask(explorer: models.TasksExplorer, task: models.ItemNode<Task>): void {
  task.contextMenu?.close()
  explorer.deleteTask(task.item)
}

function courses(explorer: models.TasksExplorer, courses: readonly models.CourseNode[]): JSX.Element[] {
  return courses.map(course => {
    let contextMenu
    if (course.contextMenu)
      contextMenu = (
        <ContextMenu model={course.contextMenu}>
          <ContextMenu.Button onClick={() => onCreateTask(explorer, course)}>New Task</ContextMenu.Button>
          <ContextMenu.Button>Edit Course</ContextMenu.Button>
          <ContextMenu.Button>Delete Course</ContextMenu.Button>
        </ContextMenu>
      )
    return (
      <li key={course.key}>
        <Explorer.Group group={course}>
          {course.title}
          {contextMenu}
        </Explorer.Group>
        <Explorer.Children group={course}>{tasks(explorer, course.children)}</Explorer.Children>
      </li>
    )
  })
}

function tasks(explorer: models.TasksExplorer, tasks: readonly models.ItemNode<Task>[]): JSX.Element[] {
  return tasks.map(task => {
    let contextMenu
    if (task.contextMenu)
      contextMenu = (
        <ContextMenu model={task.contextMenu}>
          <ContextMenu.Button onClick={() => onEditTask(explorer, task)}>Edit Task</ContextMenu.Button>
          <ContextMenu.Button onClick={() => onDeleteTask(explorer, task)}>Delete Task</ContextMenu.Button>
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
