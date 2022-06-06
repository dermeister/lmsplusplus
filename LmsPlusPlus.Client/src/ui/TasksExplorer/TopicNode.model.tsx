import { cached, isnonreactive, Transaction } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ISolutionsService } from "../ISolutionsService"
import { ITasksService } from "../ITasksService"
import { TaskNode } from "./TaskNode.model"
import * as view from "./TopicNode.view"

export class TopicNode extends Node<domain.Topic> {
    @isnonreactive readonly tasksService: ITasksService
    @isnonreactive readonly permissions: domain.Permissions
    @isnonreactive readonly solutionsService: ISolutionsService

    override get children(): Node<domain.Task>[] { return super.children as Node<domain.Task>[] }
    override get contextMenuService(): IContextMenuService { return super.contextMenuService as IContextMenuService }

    constructor(topic: domain.Topic, contextMenuService: IContextMenuService, permissions: domain.Permissions, tasksService: ITasksService,
        solutionsService: ISolutionsService) {
        super(`topic-${topic.id}`, topic, topic.name, contextMenuService, TopicNode.createTaskNodes(topic.tasks, contextMenuService, permissions,
            tasksService, solutionsService))
        this.permissions = permissions
        this.tasksService = tasksService
        this.solutionsService = solutionsService
    }

    @cached
    override renderContextMenuItems(): JSX.Element[] | null {
        return view.renderContextMenu(this)
    }

    private static createTaskNodes(tasks: readonly domain.Task[], contextMenuService: IContextMenuService, permissions: domain.Permissions,
        tasksService: ITasksService, solutionsService: ISolutionsService): Node<domain.Task>[] {
        return Transaction.run(null, () => tasks.map(task => new TaskNode(task, contextMenuService, permissions, tasksService, solutionsService)))
    }
}
