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

function courses(model: Models.TasksExplorer, courses: readonly Models.CourseNode[]): JSX.Element[] {
  return courses.map(course => (
    <li key={course.id}>
      <Explorer.Group group={course}>
        {course.title}

        <ContextMenu model={course.contextMenu}>
          <ContextMenu.Button onClick={() => model.createTask(course.item)}>New Task</ContextMenu.Button>
          <ContextMenu.Button>Edit Course</ContextMenu.Button>
          <ContextMenu.Button>Delete Course</ContextMenu.Button>
        </ContextMenu>
      </Explorer.Group>

      <Explorer.Children group={course}>{tasks(model, course.children)}</Explorer.Children>
    </li>
  ))
}

function tasks(explorer: Models.TasksExplorer, tasks: Models.ItemNode<Task>[]): JSX.Element[] {
  return tasks.map(task => (
    <Explorer.Item key={task.id} item={task}>
      {task.title}

      <ContextMenu model={task.contextMenu}>
        <ContextMenu.Button onClick={() => explorer.updateTask(task.item)}>Edit Task</ContextMenu.Button>
        <ContextMenu.Button onClick={() => explorer.deleteTask(task.item)}>Delete Task</ContextMenu.Button>
      </ContextMenu>
    </Explorer.Item>
  ))
}
