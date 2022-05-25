import React from "react"
import { autorender } from "../autorender"
import { ContextMenu } from "../ContextMenuService"
import { TopicNodeModel } from "./TopicNode.model"

interface TopicContextMenuProps {
    model: TopicNodeModel
}

export function TopicContextMenu({ model }: TopicContextMenuProps): JSX.Element {
    return autorender(() => {
        let contextMenu: JSX.Element
        if (model.context.permissions.canCreateTask)
            contextMenu = (
                <ContextMenu>
                    <ContextMenu.Button variant="primary" onClick={() => onCreateTask(model)}>
                        New Task
                    </ContextMenu.Button>
                </ContextMenu>
            )
        else
            contextMenu = <></>
        return contextMenu
    }, [model])
}

function onCreateTask(topic: TopicNodeModel): void {
    topic.contextMenuService?.close()
    // model.createTask(topic.item)
}
