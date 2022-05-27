import MarkdownIt from "markdown-it"
import React from "react"
import { cached, Monitor, options, Ref, Transaction, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { ITasksService } from "../ITasksService"
import { SolutionEditorView } from "../SolutionEditorView"
import { SolutionRunner } from "../SolutionRunnerView/SolutionRunner"
import { TaskEditorView } from "../TaskEditorView"
import { TasksExplorer } from "../TasksExplorer"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import * as view from "./TasksView.view"

export class TasksView extends View implements ITasksService {
    @unobservable private static readonly _monitor = Monitor.create("tasks-view", 0, 0)
    @unobservable private static readonly _markdown = new MarkdownIt()
    @unobservable private readonly _tasksExplorer: TasksExplorer
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _viewGroup: ViewGroup

    override get isPulsing(): boolean { return TasksView._monitor.isActive }
    override get title(): string { return "Tasks" }

    constructor(context: DatabaseContext, viewGroup: ViewGroup, contextMenuService: IContextMenuService) {
        super()
        this._context = context
        this._viewGroup = viewGroup
        this._tasksExplorer = new TasksExplorer(new Ref(this._context, "courses"), this, contextMenuService, new Ref(this._context, "permissions"))
    }

    override dispose(): void {
        Transaction.run(() => {
            this._tasksExplorer.dispose()
            super.dispose()
        })
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <view.TasksViewSidePanelContent explorer={this._tasksExplorer} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        const taskDescription = this._tasksExplorer.selectedNode?.item.description
        const taskDescriptionHtml = taskDescription ? TasksView._markdown.render(taskDescription) : null
        return <view.TasksViewMainPanelContent taskDescriptionHtml={taskDescriptionHtml} />
    }

    @transaction
    createTask(topic: domain.Topic): void {
        const task = new domain.Task(domain.Task.NO_ID, topic, "", "", [])
        const taskEditorView = new TaskEditorView(task, this._context.technologies, this._context, this._viewGroup)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    updateTask(task: domain.Task): void {
        const taskEditorView = new TaskEditorView(task, this._context.technologies, this._context, this._viewGroup)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    async deleteTask(task: domain.Task): Promise<void> {
        await this._context.deleteTask(task)
    }

    @transaction
    createSolution(task: domain.Task): void {
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "")
        const solutionEditorView = new SolutionEditorView(solution, this._context, this._viewGroup)
        this._viewGroup.openView(solutionEditorView)
    }

    @transaction
    @options({ monitor: TasksView._monitor })
    async deleteSolution(solution: domain.Solution): Promise<void> {
        await this._context.deleteSolution(solution)
    }

    @transaction
    runSolution(solutoin: domain.Solution): void {
        const solutionRunnerView = new SolutionRunner("solution-runner", solutoin, this, this._viewGroup)
        this._viewGroup.openView(solutionRunnerView)
    }
}
