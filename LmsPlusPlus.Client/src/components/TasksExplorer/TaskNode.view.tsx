import React from "react"
import { autorender } from "../autorender"
import { ContextMenu } from "../ContextMenuService"
import { TaskNodeModel } from "./TaskNode.model"

interface TaskContextMenuProps {
    model: TaskNodeModel
}

export function TaskContextMenu({ model }: TaskContextMenuProps): JSX.Element {
    return autorender(() => {
        let contextMenuBody
        if (model.context.permissions.canUpdateTask)
            contextMenuBody = (
                <ContextMenu.Button variant="primary" onClick={() => onUpdateTask(model)}>
                    Edit Task
                </ContextMenu.Button>
            )
        if (model.context.permissions.canDeleteTask)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="danger" onClick={() => onDeleteTask(model)}>
                        Delete Task
                    </ContextMenu.Button>
                </>
            )
        if (model.context.permissions.canCreateSolution && model.item.solutions.length === 0)
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onCreateSolution(model)}>
                        New Solution
                    </ContextMenu.Button>
                </>
            )
        if (model.item.solutions.length === 1) {
            contextMenuBody = (
                <>
                    {contextMenuBody}
                    <ContextMenu.Button variant="primary" onClick={() => onRunSolution(model)}>
                        Run solution
                    </ContextMenu.Button>
                </>
            )
            if (model.context.permissions.canDeleteSolution)
                contextMenuBody = (
                    <>
                        {contextMenuBody}
                        <ContextMenu.Button variant="danger" onClick={() => onDeleteSolution(model)}>
                            Delete Solution
                        </ContextMenu.Button>
                    </>
                )
        }
        return <ContextMenu>{contextMenuBody}</ContextMenu>
    }, [model])
}

function onRunSolution(model: TaskNodeModel): void {
    model.contextMenuService.close()
    model.tasksService.runSolution(model.item.solutions[0])
}

function onUpdateTask(model: TaskNodeModel): void {
    model.contextMenuService.close()
    model.tasksService.updateTask(model.item)
}

async function onDeleteTask(model: TaskNodeModel): Promise<void> {
    model.contextMenuService.close()
    // await model.tasksService.deleteTask(model.item)
}

function onCreateSolution(model: TaskNodeModel): void {
    model.contextMenuService.close()
    model.tasksService.createSolution(model.item)
}

async function onDeleteSolution(model: TaskNodeModel): Promise<void> {
    model.contextMenuService.close()
    // await model.deleteSolution(task.item.solutions[0])
}
