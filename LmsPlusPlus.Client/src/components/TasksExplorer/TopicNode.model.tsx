import { cached, isnonreactive, Transaction } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ITasksService } from "../ITasksService"
import { TaskNode } from "./TaskNode.model"
import * as view from "./TopicNode.view"

export class TopicNode extends Node<domain.Topic> {
    @isnonreactive readonly tasksService: ITasksService
    @isnonreactive readonly permissions: domain.Permissions

    override get children(): Node<domain.Task>[] { return super.children as Node<domain.Task>[] }
    override get contextMenuService(): IContextMenuService { return super.contextMenuService as IContextMenuService }

    constructor(topic: domain.Topic, contextMenuService: IContextMenuService, permissions: domain.Permissions, tasksService: ITasksService) {
        super(`topic-${topic.id}`, topic, topic.name, contextMenuService, TopicNode.createTaskNodes(topic.tasks, contextMenuService, permissions,
            tasksService))
        this.permissions = permissions
        this.tasksService = tasksService
    }

    @cached
    override renderContextMenuItems(): JSX.Element[] | null {
        return view.renderContextMenu(this)
    }

    private static createTaskNodes(tasks: readonly domain.Task[], contextMenuService: IContextMenuService, permissions: domain.Permissions,
        tasksService: ITasksService): Node<domain.Task>[] {
        return Transaction.run(null, () => tasks.map(task => new TaskNode(task, contextMenuService, permissions, tasksService)))
    }
}
