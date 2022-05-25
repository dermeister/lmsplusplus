import React from "react"
import { unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ITasksService } from "../ITasksService"
import { TaskContextMenu } from "./TaskNode.view"

export class TaskNodeModel extends Node<domain.Task> {
    @unobservable readonly context: DatabaseContext
    @unobservable readonly tasksService: ITasksService

    constructor(task: domain.Task, contextMenuService: IContextMenuService, context: DatabaseContext, tasksService: ITasksService) {
        super(`task-${task.id}`, task, task.title, contextMenuService)
        this.context = context
        this.tasksService = tasksService
    }

    override renderContextMenu(): JSX.Element | null {
        return <TaskContextMenu model={this} />
    }
}
