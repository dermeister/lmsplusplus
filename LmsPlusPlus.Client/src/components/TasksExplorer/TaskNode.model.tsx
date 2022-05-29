import React from "react"
import { cached, isnonreactive } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ITasksService } from "../ITasksService"
import * as view from "./TaskNode.view"

export class TaskNode extends Node<domain.Task> {
    @isnonreactive private readonly _permissions: domain.Permissions
    @isnonreactive private readonly _tasksService: ITasksService

    protected override get contextMenuService(): IContextMenuService { return super.contextMenuService as IContextMenuService }

    constructor(task: domain.Task, contextMenuService: IContextMenuService, permissions: domain.Permissions, tasksService: ITasksService) {
        super(`task-${task.id}`, task, task.title, contextMenuService)
        this._permissions = permissions
        this._tasksService = tasksService
    }

    @cached
    override renderContextMenuItems(): JSX.Element[] | null {
        return view.renderContextMenu({
            node: this,
            permissions: this._permissions,
            tasksService: this._tasksService,
            contextMenuService: this.contextMenuService
        })
        // return (
        //     <view.renderContextMenu({}) node={this} tasksService={this._tasksService} permissions={this._permissions}
        //         contextMenuService={this.contextMenuService} />
        // )
    }
}
