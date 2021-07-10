import React from "react"
import { Task } from "../../domain/Task"
import { Models } from "../../models"
import autorender from "../autorender"
import { ContextMenu } from "../ContextMenu"
import { Explorer } from "../explorer"

interface TasksExplorerProps {
  model: Models.TasksExplorer
}

export function TasksExplorer({ model }: TasksExplorerProps): JSX.Element {
  return autorender(
    () => <Explorer model={model}>{courses(model, model.courseNodes)}</Explorer>,
    [model]
  )
}

function onCreateTask(explorer: Models.TasksExplorer, course: Models.CourseNode): void {
  course.contextMenu.close()
  explorer.createTask(course.item)
}

function onEditTask(explorer: Models.TasksExplorer, task: Models.ItemNode<Task>): void {
  task.contextMenu.close()
  explorer.editTask(task.item)
}

function onDeleteTask(explorer: Models.TasksExplorer, task: Models.ItemNode<Task>): void {
  task.contextMenu.close()
  explorer.deleteTask(task.item)
}

function courses(explorer: Models.TasksExplorer, courses: readonly Models.CourseNode[]): JSX.Element[] {
  return courses.map(course => (
    <li key={course.id}>
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

function tasks(explorer: Models.TasksExplorer, tasks: Models.ItemNode<Task>[]): JSX.Element[] {
  return tasks.map(task => (
    <Explorer.Item key={task.id} item={task}>
      {task.title}

      <ContextMenu model={task.contextMenu}>
        <ContextMenu.Button onClick={() => onEditTask(explorer, task)}>Edit Task</ContextMenu.Button>
        <ContextMenu.Button onClick={() => onDeleteTask(explorer, task)}>Delete Task</ContextMenu.Button>
      </ContextMenu>
    </Explorer.Item>
  ))
}
