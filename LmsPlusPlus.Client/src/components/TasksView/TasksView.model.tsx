import MarkdownIt from "markdown-it"
import React from "react"
import { cached, Ref, Transaction, transaction, unobservable } from "reactronic"
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
    @unobservable private static readonly s_markdown = new MarkdownIt()
    @unobservable private readonly _tasksExplorer: TasksExplorer
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _viewGroup: ViewGroup

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
        const taskDescriptionHtml = taskDescription ? TasksView.s_markdown.render(taskDescription) : null
        return <view.TasksViewMainPanelContent taskDescriptionHtml={taskDescriptionHtml} />
    }

    @transaction
    createTask(topic: domain.Topic): void {
        throw new Error("Method not implemented.")

    }

    @transaction
    updateTask(task: domain.Task): void {
        const taskEditorView = new TaskEditorView(task, this._context.technologies, this._context, this._viewGroup)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    deleteTask(task: domain.Task): void {
        throw new Error("Method not implemented.")
    }

    @transaction
    createSolution(task: domain.Task): void {
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "", null)
        const solutionEditorView = new SolutionEditorView(solution, this._context, this._viewGroup)
        this._viewGroup.openView(solutionEditorView)
    }

    @transaction
    deleteSolution(solution: domain.Solution): void {
        throw new Error("Method not implemented.")
    }

    @transaction
    runSolution(solutoin: domain.Solution): void {
        const solutionRunnerView = new SolutionRunner("solution-runner", solutoin, this, this._viewGroup)
        this._viewGroup.openView(solutionRunnerView)
    }
}
