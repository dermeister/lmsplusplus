import React from "react"
import * as domain from "../../domain"
import * as models from "../../models"
import { autorender } from "../autorender"
import { ContextMenu } from "../ContextMenu"
import { Explorer } from "../Explorer"
import { ITasksService } from "../ITasksService"
import { usePermissions } from "../permissions"
import { TasksViewModel } from "../TasksView/TasksView.model"
import { TasksExplorer, TopicNode } from "./TasksExplorer"

interface TasksExplorerViewProps {
    model: TasksExplorer
    tasksService: ITasksService
}

export function TasksExplorerView({ model, tasksService }: TasksExplorerViewProps): JSX.Element {
    const permissions = usePermissions()

    return autorender(() => (
        <Explorer model={model}>{topics(tasksService, model.children, permissions)}</Explorer>
    ), [model, permissions])
}

function topics(model: ITasksService, topics: readonly TopicNode[], permissions: domain.Permissions): JSX.Element[] {
    return topics.map(topic => {
        let contextMenu
        if (permissions.canCreateTask)
            contextMenu = (
                <ContextMenu model={topic.contextMenu}>
                    <ContextMenu.Button variant="primary" onClick={() => onCreateTask(model, topic)}>
                        New Task
                    </ContextMenu.Button>
                </ContextMenu>
            )
        return (
            <li key={topic.key}>
                <Explorer.Group group={topic} contextMenu={contextMenu}>{topic.title}</Explorer.Group>
                <Explorer.Children group={topic}>{tasks(model, topic.children, permissions)}</Explorer.Children>
            </li>
        )
    })
}

function onCreateTask(model: ITasksService, topic: TopicNode): void {
    topic.contextMenu?.close()
    // model.createTask(topic.item)
}

function tasks(model: ITasksService,
    tasks: readonly models.ItemNode<domain.Task>[],
    permissions: domain.Permissions): JSX.Element[] {
    return tasks.map(task => {
        let contextMenuBody
        if (permissions.canUpdateTask)
            contextMenuBody = (
                <ContextMenu.Button variant="primary" onClick={() => onUpdateTask(model, task)}>
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

function onRunSolution(model: ITasksService, task: models.ItemNode<domain.Task>): void {
    task.contextMenu?.close()
    model.runSolution(task.item.solutions[0])
}

function onUpdateTask(model: ITasksService, task: models.ItemNode<domain.Task>): void {
    task.contextMenu?.close()
    model.updateTask(task.item)
}

async function onDeleteTask(model: ITasksService, task: models.ItemNode<domain.Task>): Promise<void> {
    task.contextMenu?.close()
    // await model.deleteTask(task.item)
}

function onCreateSolution(model: ITasksService, task: models.ItemNode<domain.Task>): void {
    task.contextMenu?.close()
    model.createSolution(task.item)
}

async function onDeleteSolution(model: ITasksService, task: models.ItemNode<domain.Task>): Promise<void> {
    task.contextMenu?.close()
    // await model.deleteSolution(task.item.solutions[0])
}
