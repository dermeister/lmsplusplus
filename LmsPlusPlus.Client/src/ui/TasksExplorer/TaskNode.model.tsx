import { cached, isnonreactive } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ITasksService } from "../ITasksService"
import * as view from "./TaskNode.view"

export class TaskNode extends Node<domain.Task> {
    @isnonreactive readonly permissions: domain.Permissions
    @isnonreactive readonly tasksService: ITasksService

    override get contextMenuService(): IContextMenuService { return super.contextMenuService as IContextMenuService }

    constructor(task: domain.Task, contextMenuService: IContextMenuService, permissions: domain.Permissions, tasksService: ITasksService) {
        super(`task-${task.id}`, task, task.title, contextMenuService)
        this.permissions = permissions
        this.tasksService = tasksService
    }

    @cached
    override renderContextMenuItems(): JSX.Element[] | null {
        return view.renderContextMenu(this)
    }
}
