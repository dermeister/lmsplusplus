import React from "react"
import { Transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ITasksService } from "../ITasksService"
import { TaskNodeModel } from "./TaskNode.model"
import { TopicContextMenu } from "./TopicNode.view"

export class TopicNodeModel extends Node<domain.Topic> {
    @unobservable readonly context: DatabaseContext
    @unobservable readonly contextMenuService: IContextMenuService
    @unobservable readonly tasksService: ITasksService

    override get children(): Node<domain.Task>[] { return super.children as Node<domain.Task>[] }

    constructor(topic: domain.Topic, contextMenuService: IContextMenuService, context: DatabaseContext, tasksService: ITasksService) {
        super(`topic-${topic.id}`, topic, topic.name, TopicNodeModel.createTaskNodes(topic.tasks, contextMenuService, context, tasksService))
        this.contextMenuService = contextMenuService
        this.context = context
        this.tasksService = tasksService
    }

    private static createTaskNodes(tasks: readonly domain.Task[], contextMenuService: IContextMenuService, context: DatabaseContext, tasksService: ITasksService): Node<domain.Task>[] {
        return Transaction.run(() => tasks.map(task => new TaskNodeModel(task, contextMenuService, context, tasksService)))
    }

    override onContextMenu(x: number, y: number): void {
        this.contextMenuService.open(<TopicContextMenu model={this} />, x, y)
    }
}

