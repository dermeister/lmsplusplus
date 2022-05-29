import React from "react"
import * as domain from "../../domain"
import { autorender } from "../autorender"
import { ContextMenu, IContextMenuService } from "../ContextMenuService"
import { ITasksService } from "../ITasksService"
import { TopicNode as TopicNode } from "./TopicNode.model"

interface TopicContextMenuProps {
    node: TopicNode
    permissions: domain.Permissions
    tasksService: ITasksService
    contextMenuService: IContextMenuService
}

export function renderContextMenu({ node, permissions, tasksService, contextMenuService }: TopicContextMenuProps): JSX.Element[] {
    function onCreateTask(): void {
        contextMenuService.close()
        tasksService.createTask(node.item)
    }

    const contextMenuItems = []
    if (permissions.canCreateTask)
        contextMenuItems.push(
            <ContextMenu.Button variant="primary" onClick={() => onCreateTask()}>
                New Task
            </ContextMenu.Button>
        )
    return contextMenuItems
}
