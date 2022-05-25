import { reaction, Ref, Rx, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Explorer } from "../Explorer"
import { ITasksService } from "../ITasksService"
import { TopicNode } from "./TopicNode.model"

export class TasksExplorer extends Explorer<domain.Task> {
    @unobservable private readonly _permissions: Ref<domain.Permissions>
    @unobservable private readonly _tasksService: ITasksService
    @unobservable private readonly _topics: Ref<readonly domain.Topic[]>
    @unobservable private readonly _contextMenuService: IContextMenuService

    constructor(topics: Ref<readonly domain.Topic[]>, tasksSerivce: ITasksService, contextMenuService: IContextMenuService,
        permissions: Ref<domain.Permissions>) {
        super(TasksExplorer.createChildren(topics.value, contextMenuService, permissions.value, tasksSerivce))
        this._permissions = permissions
        this._tasksService = tasksSerivce
        this._topics = topics
        this._contextMenuService = contextMenuService
    }

    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this._permissions)
            super.dispose()
        })
    }

    private static createChildren(topics: readonly domain.Topic[], contextMenuService: IContextMenuService, permissions: domain.Permissions,
        tasksSerivce: ITasksService): readonly TopicNode[] {
        return topics.map(c => new TopicNode(c, contextMenuService, permissions, tasksSerivce))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = TasksExplorer.createChildren(this._topics.value, this._contextMenuService, this._permissions.value, this._tasksService)
        this.updateChildren(newChildren)
    }
}
