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
    @unobservable readonly contextMenuService: IContextMenuService
    @unobservable readonly tasksService: ITasksService

    constructor(task: domain.Task, contextMenuService: IContextMenuService, context: DatabaseContext, tasksService: ITasksService) {
        super(`task-${task.id}`, task, task.title, null)
        this.contextMenuService = contextMenuService
        this.context = context
        this.tasksService = tasksService
    }

    override onContextMenu(x: number, y: number): void {
        this.contextMenuService.open(<TaskContextMenu model={this} />, x, y)
    }
}
