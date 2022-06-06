import { isnonreactive, reaction, Ref, Rx, Transaction } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Explorer } from "../Explorer"
import { ISolutionsService } from "../ISolutionsService"
import { ITasksService } from "../ITasksService"
import { TopicNode } from "./TopicNode.model"

export class TasksExplorer extends Explorer<domain.Task> {
    @isnonreactive private readonly _permissions: Ref<domain.Permissions>
    @isnonreactive private readonly _tasksService: ITasksService
    @isnonreactive private readonly _topics: Ref<readonly domain.Topic[]>
    @isnonreactive private readonly _contextMenuService: IContextMenuService
    @isnonreactive private readonly _solutionsService: ISolutionsService

    constructor(topics: Ref<readonly domain.Topic[]>, tasksSerivce: ITasksService, contextMenuService: IContextMenuService,
        permissions: Ref<domain.Permissions>, solutionsService: ISolutionsService) {
        super(TasksExplorer.createChildren(topics.value, contextMenuService, permissions.value, tasksSerivce, solutionsService))
        this._permissions = permissions
        this._tasksService = tasksSerivce
        this._topics = topics
        this._contextMenuService = contextMenuService
        this._solutionsService = solutionsService
    }

    override dispose(): void {
        Transaction.run(null, () => {
            Rx.dispose(this._permissions)
            super.dispose()
        })
    }

    private static createChildren(topics: readonly domain.Topic[], contextMenuService: IContextMenuService, permissions: domain.Permissions,
        tasksSerivce: ITasksService, solutionsService: ISolutionsService): readonly TopicNode[] {
        return topics.map(c => new TopicNode(c, contextMenuService, permissions, tasksSerivce, solutionsService))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = TasksExplorer.createChildren(this._topics.value, this._contextMenuService, this._permissions.value, this._tasksService,
            this._solutionsService)
        this.updateChildren(newChildren)
    }
}
