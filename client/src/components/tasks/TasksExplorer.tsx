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
  course.contextMenu.close()
  explorer.setCourseToCreateTaskIn(course.item)
}

function onEditTask(explorer: models.TasksExplorer, task: models.ItemNode<Task>): void {
  task.contextMenu.close()
  explorer.setTaskToEdit(task.item)
}

function onDeleteTask(explorer: models.TasksExplorer, task: models.ItemNode<Task>): void {
  task.contextMenu.close()
  explorer.setTaskToDelete(task.item)
}

function courses(explorer: models.TasksExplorer, courses: readonly models.CourseNode[]): JSX.Element[] {
  return courses.map(course => (
    <li key={course.key}>
      <Explorer.Group group={course}>
        {course.title}

        <ContextMenu model={course.contextMenu}>
          <ContextMenu.Button onClick={() => onCreateTask(explorer, course)}>New Task</ContextMenu.Button>
          <ContextMenu.Button>Edit Course</ContextMenu.Button>
          <ContextMenu.Button>Delete Course</ContextMenu.Button>
        </ContextMenu>
      </Explorer.Group>

      <Explorer.Children group={course}>{tasks(explorer, course.children)}</Explorer.Children>
    </li>
  ))
}

function tasks(explorer: models.TasksExplorer, tasks: readonly models.ItemNode<Task>[]): JSX.Element[] {
  return tasks.map(task => (
    <Explorer.Item key={task.key} item={task}>
      {task.title}

      <ContextMenu model={task.contextMenu}>
        <ContextMenu.Button onClick={() => onEditTask(explorer, task)}>Edit Task</ContextMenu.Button>
        <ContextMenu.Button onClick={() => onDeleteTask(explorer, task)}>Delete Task</ContextMenu.Button>
      </ContextMenu>
    </Explorer.Item>
  ))
}
