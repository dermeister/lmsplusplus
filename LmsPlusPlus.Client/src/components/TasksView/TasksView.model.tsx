import MarkdownIt from "markdown-it"
import React from "react"
import { cached, Ref, Transaction, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { ITasksService } from "../ITasksService"
import { SolutionEditorView } from "../SolutionEditorView/SolutionEditor"
import { SolutionRunner } from "../SolutionRunnerView/SolutionRunner"
import { TaskEditorView } from "../TaskEditorView/TaskEditor.model"
import { TasksExplorer } from "../TasksExplorer"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { TasksViewMainPanelContent, TasksViewSidePanelContent } from "./TasksView.view"

export class TasksViewModel extends View implements ITasksService {
    @unobservable readonly tasksExplorer: TasksExplorer
    @unobservable private static readonly s_markdown = new MarkdownIt()
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _viewGroup: ViewGroup

    override get title(): string { return "Tasks" }
    @cached get taskDescriptionHtml(): string | null {
        const description = this.tasksExplorer.selectedNode?.item.description
        return description ? TasksViewModel.s_markdown.render(description) : null
    }

    constructor(context: DatabaseContext, viewGroup: ViewGroup, contextMenuService: IContextMenuService) {
        super()
        this._context = context
        this._viewGroup = viewGroup
        this.tasksExplorer = new TasksExplorer(new Ref(this._context, "courses"), this, contextMenuService, this._context)
    }

    override dispose(): void {
        Transaction.run(() => {
            this.tasksExplorer.dispose()
            super.dispose()
        })
    }

    override renderSidePanelContent(): JSX.Element {
        return <TasksViewSidePanelContent model={this} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <TasksViewMainPanelContent model={this} />
    }

    @transaction
    updateTask(task: domain.Task): void {
        const taskEditorView = new TaskEditorView(task, this._context.technologies, this._context, this._viewGroup)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    createSolution(task: domain.Task): void {
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "", null)
        const solutionEditorView = new SolutionEditorView(solution, this._context, this._viewGroup)
        this._viewGroup.openView(solutionEditorView)
    }

    @transaction
    runSolution(solutoin: domain.Solution): void {
        const solutionRunnerView = new SolutionRunner("solution-runner", solutoin, this, this._viewGroup)
        this._viewGroup.openView(solutionRunnerView)
    }
}
