import { reaction, Ref, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Explorer } from "../Explorer"
import { ITasksService } from "../ITasksService"
import { TopicNodeModel } from "./TopicNode.model"

export class TasksExplorerModel extends Explorer<domain.Task> {
    @unobservable readonly context: DatabaseContext
    @unobservable private readonly _tasksService: ITasksService
    @unobservable private readonly _topics: Ref<readonly domain.Topic[]>
    @unobservable private readonly _contextMenuService: IContextMenuService

    constructor(topics: Ref<readonly domain.Topic[]>, tasksSerivce: ITasksService, contextMenuService: IContextMenuService, context: DatabaseContext) {
        super(TasksExplorerModel.createChildren(topics.value, contextMenuService, context, tasksSerivce))
        this.context = context
        this._tasksService = tasksSerivce
        this._topics = topics
        this._contextMenuService = contextMenuService
    }

    private static createChildren(topics: readonly domain.Topic[], contextMenuService: IContextMenuService, context: DatabaseContext, tasksSerivce: ITasksService): readonly TopicNodeModel[] {
        return topics.map(c => new TopicNodeModel(c, contextMenuService, context, tasksSerivce))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = TasksExplorerModel.createChildren(this._topics.value, this._contextMenuService, this.context, this._tasksService)
        this.updateChildren(newChildren)
    }
}
