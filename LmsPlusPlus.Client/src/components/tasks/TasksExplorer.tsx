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
        <Explorer model={model.tasksExplorer}>{courses(model, model.tasksExplorer.children, permissions)}</Explorer>
    ), [model, permissions])
}

function onRunSolution(model: models.TasksView, task: models.ItemNode<domain.Task>): void {
    task.contextMenu?.close()
    model.runSolution(task.item.solutions[0])
}

function onCreateTask(model: models.TasksView, course: models.CourseNode): void {
    course.contextMenu?.close()
    model.createTask(course.item)
}

function onUpdate(model: models.TasksView, task: models.ItemNode<domain.Task>): void {
    task.contextMenu?.close()
    model.updateTask(task.item)
}

async function onDeleteTask(model: models.TasksView, task: models.ItemNode<domain.Task>): Promise<void> {
    task.contextMenu?.close()
    await model.deleteTask(task.item)
}

function onCreateSolution(model: models.TasksView, task: models.ItemNode<domain.Task>): void {
    task.contextMenu?.close()
    model.createSolution(task.item)
}

async function onDeleteSolution(model: models.TasksView, task: models.ItemNode<domain.Task>): Promise<void> {
    task.contextMenu?.close()
    await model.deleteSolution(task.item.solutions[0])
}

function courses(model: models.TasksView,
    courses: readonly models.CourseNode[],
    permissions: domain.Permissions): JSX.Element[] {
    return courses.map(course => {
        let contextMenu
        if (permissions.canCreateTask)
            contextMenu = (
                <ContextMenu model={course.contextMenu}>
                    <ContextMenu.Button variant="primary" onClick={() => onCreateTask(model, course)}>
                        New Task
                    </ContextMenu.Button>
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
        let contextMenuBody
        if (permissions.canUpdateTask)
            contextMenuBody = (
                <ContextMenu.Button variant="primary" onClick={() => onUpdate(model, task)}>
                    Edit Task
                </ContextMenu.Button>
            )
        if (permissions.canDeleteTask)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="danger" onClick={() => onDeleteTask(model, task)}>
                        Delete Task
                    </ContextMenu.Button>
                </>
            )
        if (permissions.canCreateSolution && task.item.solutions.length === 0)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onCreateSolution(model, task)}>
                        New Solution
                    </ContextMenu.Button>
                </>
            )
        if (task.item.solutions.length === 1) {
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onRunSolution(model, task)}>
                        Run solution
                    </ContextMenu.Button>
                </>
            )
            if (permissions.canDeleteSolution)
                contextMenuBody = (
                    <>
                        {contextMenuBody}
                        <ContextMenu.Button variant="danger" onClick={() => onDeleteSolution(model, task)}>
                            Delete Solution
                        </ContextMenu.Button>
                    </>
                )
        }
        const contextMenu = (
            <ContextMenu model={task.contextMenu}>
                {contextMenuBody}
            </ContextMenu>
        )
        return <Explorer.Item key={task.key} item={task} contextMenu={contextMenu}>{task.title}</Explorer.Item>
    })
}
