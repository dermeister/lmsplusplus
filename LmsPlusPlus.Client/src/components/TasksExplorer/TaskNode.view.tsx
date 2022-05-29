import React from "react"
import * as domain from "../../domain"
import { autorender } from "../autorender"
import { ContextMenu, IContextMenuService } from "../ContextMenuService"
import { ITasksService } from "../ITasksService"
import * as model from "./TaskNode.model"

interface TaskContextMenuProps {
    node: model.TaskNode
    permissions: domain.Permissions
    tasksService: ITasksService
    contextMenuService: IContextMenuService
}

export function renderContextMenu({ permissions, node, tasksService, contextMenuService }: TaskContextMenuProps): JSX.Element[] {
    function onRunSolution(): void {
        contextMenuService.close()
        tasksService.runSolution(node.item.solutions[0])
    }

    function onUpdateTask(): void {
        contextMenuService.close()
        tasksService.updateTask(node.item)
    }

    async function onDeleteTask(): Promise<void> {
        contextMenuService.close()
        tasksService.deleteTask(node.item)
    }

    function onCreateSolution(): void {
        contextMenuService.close()
        tasksService.createSolution(node.item)
    }

    async function onDeleteSolution(): Promise<void> {
        contextMenuService.close()
        tasksService.deleteSolution(node.item.solutions[0])
    }

    function onOpenSolution(): void {
        contextMenuService.close()
        window.open(node.item.solutions[0].websiteUrl as string, "_blank")
    }

    function onCopySolutionCopyUrl(): void {
        contextMenuService.close()
        navigator.clipboard.writeText(node.item.solutions[0].cloneUrl as string)
    }

    let key = 1
    const contextMenuItems = []
    if (permissions.canUpdateTask)
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="primary" onClick={onUpdateTask}>
                Edit Task
            </ContextMenu.Button>
        )
    if (permissions.canDeleteTask)
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="danger" onClick={onDeleteTask}>
                Delete Task
            </ContextMenu.Button>
        )
    if (permissions.canCreateSolution && node.item.solutions.length === 0)
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="primary" onClick={onCreateSolution}>
                New Solution
            </ContextMenu.Button>
        )
    if (node.item.solutions.length === 1) {
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="primary" onClick={onRunSolution}>
                Run Solution
            </ContextMenu.Button>
        )
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="primary" onClick={onOpenSolution}>
                Open Solution
            </ContextMenu.Button>
        )
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="primary" onClick={onCopySolutionCopyUrl}>
                Copy Solution Clone URL
            </ContextMenu.Button>
        )
        if (permissions.canDeleteSolution)
            contextMenuItems.push(
                <ContextMenu.Button key={key++} variant="danger" onClick={onDeleteSolution}>
                    Delete Solution
                </ContextMenu.Button>
            )
    }
    return contextMenuItems
}

