import React from "react"
import * as domain from "../../domain"
import * as models from "../../models"
import { autorender } from "../autorender"
import { ContextMenu, IContextMenuService } from "../ContextMenuService"
import { Explorer } from "../Explorer"
import { ITasksService } from "../ITasksService"
import { TasksExplorer, TopicNode } from "./TasksExplorer"

interface TasksExplorerViewProps {
    model: TasksExplorer
    tasksService: ITasksService
    contextMenuService: IContextMenuService
}

export function TasksExplorerView({ model, tasksService, contextMenuService }: TasksExplorerViewProps): JSX.Element {
    return autorender(() => (
        <Explorer model={model}>{topics(tasksService, model.children, model.context.permissions, contextMenuService)}</Explorer>
    ), [model, tasksService, contextMenuService])
}

function topics(model: ITasksService, topics: readonly TopicNode[], permissions: domain.Permissions,
    contextMenuService: IContextMenuService): JSX.Element[] {
    return topics.map(topic => {
        let contextMenu: JSX.Element | undefined
        if (permissions.canCreateTask)
            contextMenu = (
                <ContextMenu>
                    <ContextMenu.Button variant="primary" onClick={() => onCreateTask(model, topic, contextMenuService)}>
                        New Task
                    </ContextMenu.Button>
                </ContextMenu>
            )
        return (
            <li key={topic.key}>
                <Explorer.Group group={topic} contextMenu={contextMenu} onContextMenu={(x, y) => {
                    if (contextMenu)
                        contextMenuService.open(contextMenu, x, y)
                }}>{topic.title}</Explorer.Group>
                <Explorer.Children group={topic}>{tasks(model, topic.children, permissions, contextMenuService)}</Explorer.Children>
            </li>
        )
    })
}

function onCreateTask(model: ITasksService, topic: TopicNode, contextMenuService: IContextMenuService): void {
    contextMenuService?.close()
    // model.createTask(topic.item)
}

function tasks(model: ITasksService,
    tasks: readonly models.ItemNode<domain.Task>[],
    permissions: domain.Permissions, contextMenuService: IContextMenuService): JSX.Element[] {
    return tasks.map(task => {
        let contextMenuBody
        if (permissions.canUpdateTask)
            contextMenuBody = (
                <ContextMenu.Button variant="primary" onClick={() => onUpdateTask(model, task, contextMenuService)}>
                    Edit Task
                </ContextMenu.Button>
            )
        if (permissions.canDeleteTask)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="danger" onClick={() => onDeleteTask(model, task, contextMenuService)}>
                        Delete Task
                    </ContextMenu.Button>
                </>
            )
        if (permissions.canCreateSolution && task.item.solutions.length === 0)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onCreateSolution(model, task, contextMenuService)}>
                        New Solution
                    </ContextMenu.Button>
                </>
            )
        if (task.item.solutions.length === 1) {
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onRunSolution(model, task, contextMenuService)}>
                        Run solution
                    </ContextMenu.Button>
                </>
            )
            if (permissions.canDeleteSolution)
                contextMenuBody = (
                    <>
                        {contextMenuBody}
                        <ContextMenu.Button variant="danger" onClick={() => onDeleteSolution(model, task, contextMenuService)}>
                            Delete Solution
                        </ContextMenu.Button>
                    </>
                )
        }
        const contextMenu = (
            <ContextMenu>
                {contextMenuBody}
            </ContextMenu>
        )
        return (
            <Explorer.Item key={task.key}
                item={task}
                contextMenu={contextMenu}
                onContextMenu={(x, y) => contextMenuService.open(contextMenu, x, y)}>
                {task.title}
            </Explorer.Item>
        )
    })
}

function onRunSolution(model: ITasksService, task: models.ItemNode<domain.Task>, contextMenuService: IContextMenuService): void {
    contextMenuService.close()
    model.runSolution(task.item.solutions[0])
}

function onUpdateTask(model: ITasksService, task: models.ItemNode<domain.Task>, contextMenuService: IContextMenuService): void {
    contextMenuService.close()
    model.updateTask(task.item)
}

async function onDeleteTask(model: ITasksService, task: models.ItemNode<domain.Task>, contextMenuService: IContextMenuService): Promise<void> {
    contextMenuService.close()
    // await model.deleteTask(task.item)
}

function onCreateSolution(model: ITasksService, task: models.ItemNode<domain.Task>, contextMenuService: IContextMenuService): void {
    contextMenuService.close()
    model.createSolution(task.item)
}

async function onDeleteSolution(model: ITasksService, task: models.ItemNode<domain.Task>, contextMenuService: IContextMenuService): Promise<void> {
    contextMenuService.close()
    // await model.deleteSolution(task.item.solutions[0])
}
