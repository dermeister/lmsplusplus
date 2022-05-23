import React from "react"
import { reaction, Ref, Transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { Explorer, GroupNode, ItemNode } from "../../models"
import { IContextMenuService } from "../ContextMenuService"
import { ITasksService } from "../ITasksService"
import { TasksViewModel } from "../TasksView/TasksView.model"
import { TasksExplorerView } from "./TasksExplorerView"

export class TopicNode extends GroupNode {
    @unobservable readonly item: domain.Topic

    override get children(): readonly ItemNode<domain.Task>[] {
        return super.children as readonly ItemNode<domain.Task>[]
    }

    constructor(topic: domain.Topic) {
        super(topic.name, `topic-${topic.id}`, TopicNode.createTaskNodes(topic.tasks))
        this.item = topic
    }

    private static createTaskNodes(tasks: readonly domain.Task[]): readonly ItemNode<domain.Task>[] {
        return Transaction.run(() => tasks.map(task => new ItemNode(task.title, `task-${task.id}`, task)))
    }
}

export class TasksExplorer extends Explorer<domain.Task, TopicNode> {
    @unobservable readonly context: DatabaseContext
    @unobservable private readonly _tasksService: ITasksService
    @unobservable private readonly _topics: Ref<readonly domain.Topic[]>

    constructor(topics: Ref<readonly domain.Topic[]>, tasksSerivce: ITasksService, contextMenuService: IContextMenuService, context: DatabaseContext) {
        super(TasksExplorer.createChildren(topics.value), contextMenuService)
        this.context = context
        this._tasksService = tasksSerivce
        this._topics = topics
    }

    render(): JSX.Element {
        return <TasksExplorerView model={this} tasksService={this._tasksService} />
    }

    private static createChildren(topics: readonly domain.Topic[]): readonly TopicNode[] {
        return topics.map(c => new TopicNode(c))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = TasksExplorer.createChildren(this._topics.value)
        this.updateChildren(newChildren)
    }
}
