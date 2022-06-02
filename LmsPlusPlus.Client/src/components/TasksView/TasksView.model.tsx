import MarkdownIt from "markdown-it"
import React from "react"
import { cached, isnonreactive, Monitor, options, Ref, Transaction, transaction } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { IErrorService } from "../ErrorService"
import { ITasksService } from "../ITasksService"
import { SolutionEditorView } from "../SolutionEditorView"
import { SolutionRunnerView } from "../SolutionRunnerView"
import { TaskEditorView } from "../TaskEditorView"
import { TasksExplorer } from "../TasksExplorer"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import * as view from "./TasksView.view"

export class TasksView extends View implements ITasksService {
    @isnonreactive readonly tasksExplorer: TasksExplorer
    @isnonreactive private static readonly _monitor = Monitor.create("tasks-view", 0, 0, 0)
    @isnonreactive private static readonly _markdown = new MarkdownIt()
    @isnonreactive private readonly _context: DatabaseContext
    @isnonreactive private readonly _viewGroup: ViewGroup
    @isnonreactive private readonly _errorService: IErrorService

    override get shouldShowLoader(): boolean { return TasksView._monitor.isActive }
    override get title(): string { return "Tasks" }
    get taskDescriptionHtml(): string | null {
        const taskDescription = this.tasksExplorer.selectedNode?.item.description
        return taskDescription ? TasksView._markdown.render(taskDescription) : null
    }

    constructor(context: DatabaseContext, viewGroup: ViewGroup, contextMenuService: IContextMenuService, errorService: IErrorService) {
        super()
        this._context = context
        this._viewGroup = viewGroup
        this._errorService = errorService
        this.tasksExplorer = new TasksExplorer(new Ref(this._context, "topics"), this, contextMenuService, new Ref(this._context, "permissions"))
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
        const taskEditorView = new TaskEditorView(task, this._context.technologies, this._context, this._viewGroup, this._errorService)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    updateTask(task: domain.Task): void {
        const taskEditorView = new TaskEditorView(task, this._context.technologies, this._context, this._viewGroup, this._errorService)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    async deleteTask(task: domain.Task): Promise<void> {
        try {
            await this._context.deleteTask(task)
        } catch (error) {
            Transaction.off(() => {
                if (error instanceof Error)
                    this._errorService.showError(error)
            })
        }
    }

    @transaction
    createSolution(task: domain.Task): void {
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "", null, null)
        const solutionEditorView = new SolutionEditorView(solution, this._context, this._viewGroup, this._errorService)
        this._viewGroup.openView(solutionEditorView)
    }

    @transaction
    @options({ monitor: TasksView._monitor })
    async deleteSolution(solution: domain.Solution): Promise<void> {
        await this._context.deleteSolution(solution)
    }

    @transaction
    runSolution(solution: domain.Solution): void {
        const solutionRunnerView = new SolutionRunnerView(solution, this._viewGroup, this._errorService)
        this._viewGroup.openView(solutionRunnerView)
    }
}
