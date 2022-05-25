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

export function TopicContextMenu({ node, permissions, tasksService, contextMenuService }: TopicContextMenuProps): JSX.Element {
    function onCreateTask(): void {
        contextMenuService.close()
        tasksService.createTask(node.item)
    }

    return autorender(() => {
        let contextMenu: JSX.Element
        if (permissions.canCreateTask)
            contextMenu = (
                <ContextMenu>
                    <ContextMenu.Button variant="primary" onClick={() => onCreateTask()}>
                        New Task
                    </ContextMenu.Button>
                </ContextMenu>
            )
        else
            contextMenu = <></>
        return contextMenu
    }, [node, permissions, tasksService, contextMenuService])
}
