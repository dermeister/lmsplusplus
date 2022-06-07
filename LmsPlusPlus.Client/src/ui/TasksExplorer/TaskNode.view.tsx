import React from "react"
import { ContextMenu } from "../ContextMenuService"
import * as model from "./TaskNode.model"

export function renderContextMenu(node: model.TaskNode): JSX.Element[] {
    function onRunSolution(): void {
        node.contextMenuService.close()
        node.tasksService.runSolution(node.item.solutions[0])
    }

    function onUpdateTask(): void {
        node.contextMenuService.close()
        node.tasksService.updateTask(node.item)
    }

    async function onDeleteTask(): Promise<void> {
        node.contextMenuService.close()
        node.tasksService.deleteTask(node.item)
    }

    function onCreateSolution(): void {
        node.contextMenuService.close()
        node.solutionsService.createSolution(node.item)
    }

    async function onDeleteSolution(): Promise<void> {
        node.contextMenuService.close()
        node.solutionsService.deleteSolution(node.item.solutions[0])
    }

    function onOpenSolution(): void {
        node.contextMenuService.close()
        window.open(node.item.solutions[0].websiteUrl as string, "_blank")
    }

    function onCopySolutionCopyUrl(): void {
        node.contextMenuService.close()
        navigator.clipboard.writeText(node.item.solutions[0].cloneUrl as string)
    }

    function onOpenSolutions(): void {
        node.contextMenuService.close()
        node.solutionsService.openSolutions(node.item)
    }

    let key = 1
    const contextMenuItems = []
    if (node.permissions.canUpdateTask)
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="primary" onClick={onUpdateTask}>Edit Task</ContextMenu.Button>
        )
    if (node.permissions.canDeleteTask)
        contextMenuItems.push(
            <ContextMenu.Button key={key++} variant="danger" onClick={onDeleteTask}>Delete Task</ContextMenu.Button>
        )
    if (node.item.solutions.length === 0) {
        if (node.permissions.canCreateSolution)
            contextMenuItems.push(
                <ContextMenu.Button key={key++} variant="primary" onClick={onCreateSolution}>New Solution</ContextMenu.Button>
            )
    } else {
        if (node.permissions.canViewAllSolutions) {
            contextMenuItems.push(
                <ContextMenu.Button key={key++} variant="primary" onClick={onOpenSolutions}>Open Solutions</ContextMenu.Button>
            )
        } else {
            contextMenuItems.push(
                <ContextMenu.Button key={key++} variant="primary" onClick={onRunSolution}>Run Solution</ContextMenu.Button>
            )
            contextMenuItems.push(
                <ContextMenu.Button key={key++} variant="primary" onClick={onOpenSolution}>Open Solution</ContextMenu.Button>
            )
            contextMenuItems.push(
                <ContextMenu.Button key={key++} variant="primary" onClick={onCopySolutionCopyUrl}>Copy Solution Clone URL</ContextMenu.Button>
            )
            if (node.permissions.canDeleteSolution)
                contextMenuItems.push(
                    <ContextMenu.Button key={key++} variant="danger" onClick={onDeleteSolution}>Delete Solution</ContextMenu.Button>
                )
        }
    }
    return contextMenuItems
}
