import MarkdownIt from "markdown-it"
import React from "react"
import { cached, isnonreactive, Monitor, options, Ref, Transaction, transaction } from "reactronic"
import { Storage } from "../../api"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { ITasksService } from "../ITasksService"
import { IMessageService } from "../MessageService"
import { SolutionEditorView } from "../SolutionEditorView"
import { SolutionRunnerView } from "../SolutionRunnerView"
import { TaskEditorView } from "../TaskEditorView"
import { TasksExplorer } from "../TasksExplorer"
import { handleError } from "../utils"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import * as view from "./TasksView.view"

export class TasksView extends View implements ITasksService {
    @isnonreactive readonly tasksExplorer: TasksExplorer
    @isnonreactive private static readonly _monitor = Monitor.create("tasks-view", 0, 0, 0)
    @isnonreactive private static readonly _markdown = new MarkdownIt()
    @isnonreactive private readonly _storage: Storage
    @isnonreactive private readonly _viewGroup: ViewGroup
    @isnonreactive private readonly _messageService: IMessageService

    override get shouldShowLoader(): boolean { return TasksView._monitor.isActive }
    override get title(): string { return "Tasks" }
    get taskDescriptionHtml(): string | null {
        const taskDescription = this.tasksExplorer.selectedNode?.item.description
        return taskDescription ? TasksView._markdown.render(taskDescription) : null
    }

    constructor(storage: Storage, viewGroup: ViewGroup, contextMenuService: IContextMenuService, messageService: IMessageService) {
        super()
        this._storage = storage
        this._viewGroup = viewGroup
        this._messageService = messageService
        this.tasksExplorer = new TasksExplorer(new Ref(this._storage, "topics"), this, contextMenuService, new Ref(this._storage, "permissions"))
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this.tasksExplorer.dispose()
            super.dispose()
        })
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <view.TasksViewSidePanelContent view={this} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        return <view.TasksViewMainPanelContent view={this} />
    }

    @transaction
    createTask(topic: domain.Topic): void {
        const task = new domain.Task(domain.Task.NO_ID, topic, "", "", [])
        const taskEditorView = new TaskEditorView(task, this._storage.technologies, this._storage, this._viewGroup, this._messageService)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    updateTask(task: domain.Task): void {
        const taskEditorView = new TaskEditorView(task, this._storage.technologies, this._storage, this._viewGroup, this._messageService)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    async deleteTask(task: domain.Task): Promise<void> {
        try {
            await this._storage.deleteTask(task)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }

    @transaction
    createSolution(task: domain.Task): void {
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "", null, null)
        const solutionEditorView = new SolutionEditorView(solution, this._storage, this._viewGroup, this._messageService)
        this._viewGroup.openView(solutionEditorView)
    }

    @transaction
    @options({ monitor: TasksView._monitor })
    async deleteSolution(solution: domain.Solution): Promise<void> {
        await this._storage.deleteSolution(solution)
    }

    @transaction
    runSolution(solution: domain.Solution): void {
        const solutionRunnerView = new SolutionRunnerView(solution, this._viewGroup, this._messageService)
        this._viewGroup.openView(solutionRunnerView)
    }
}
