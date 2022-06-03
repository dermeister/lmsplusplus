import React from "react"
import { ContextMenu } from "../ContextMenuService"
import * as model from "./TopicNode.model"

export function renderContextMenu(node: model.TopicNode): JSX.Element[] {
    function onCreateTask(): void {
        node.contextMenuService.close()
        node.tasksService.createTask(node.item)
    }

    const contextMenuItems = []
    if (node.permissions.canCreateTask)
        contextMenuItems.push(
            <ContextMenu.Button key={1} variant="primary" onClick={() => onCreateTask()}>New Task</ContextMenu.Button>
        )
    return contextMenuItems
}
