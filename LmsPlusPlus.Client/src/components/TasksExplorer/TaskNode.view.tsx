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

export function TaskContextMenu({ permissions, node, tasksService, contextMenuService }: TaskContextMenuProps): JSX.Element {
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

    return autorender(() => {
        let contextMenuBody
        if (permissions.canUpdateTask)
            contextMenuBody = (
                <ContextMenu.Button variant="primary" onClick={() => onUpdateTask()}>
                    Edit Task
                </ContextMenu.Button>
            )
        if (permissions.canDeleteTask)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="danger" onClick={() => onDeleteTask()}>
                        Delete Task
                    </ContextMenu.Button>
                </>
            )
        if (permissions.canCreateSolution && node.item.solutions.length === 0)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onCreateSolution()}>
                        New Solution
                    </ContextMenu.Button>
                </>
            )
        if (node.item.solutions.length === 1) {
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onRunSolution()}>
                        Run solution
                    </ContextMenu.Button>
                </>
            )
            if (permissions.canDeleteSolution)
                contextMenuBody = (
                    <>
                        {contextMenuBody}
                        <ContextMenu.Button variant="danger" onClick={() => onDeleteSolution()}>
                            Delete Solution
                        </ContextMenu.Button>
                    </>
                )
        }
        return <ContextMenu>{contextMenuBody}</ContextMenu>
    }, [node, permissions, tasksService, contextMenuService])
}

