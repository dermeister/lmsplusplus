import React from "react"
import { View } from "../View"
import viewSwitchButtonIcon from "../../assets/tasks.svg"
import { IViewService } from "../IViewService"
import { DatabaseContext } from "../../database"
import { cached, Ref, transaction, unobservable } from "reactronic"
import { TasksExplorer } from "../TasksExplorer"
import * as domain from "../../domain"
import MarkdownIt from "markdown-it"
import { TasksViewMainPanelContent, TasksViewSidePanelContent } from "./TasksView.view"
import { ViewGroup } from "../ViewGroup"
import { ITasksService } from "../ITasksService"
import { TaskEditorView } from "../TaskEditorView/TaskEditor"
import { SolutionEditorView } from "../SolutionEditorView/SolutionEditor"
import { SolutionRunner } from "../SolutionRunnerView/SolutionRunner"
import { IContextMenuService } from "../ContextMenuService"

export class TasksViewModel extends View implements ITasksService {
    @unobservable readonly tasksExplorer: TasksExplorer
    private static readonly s_markdown = new MarkdownIt()
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _viewGroup: ViewGroup

    override get title(): string { return "Tasks" }
    @cached get taskDescriptionHtml(): string | null {
        const description = this.tasksExplorer.selectedNode?.item.description
        if (!description)
            return null
        return TasksViewModel.s_markdown.render(description)
    }
    private get topics(): readonly domain.Topic[] { return this._context.courses }

    constructor(id: string, context: DatabaseContext, viewGroup: ViewGroup, contextMenuService: IContextMenuService) {
        super(id)
        this._context = context
        this._viewGroup = viewGroup
        this.tasksExplorer = new TasksExplorer(new Ref(this, "topics"), this, contextMenuService)
    }

    override renderSidePanelContent(): JSX.Element {
        return <TasksViewSidePanelContent model={this} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <TasksViewMainPanelContent model={this} />
    }

    @transaction
    updateTask(task: domain.Task): void {
        const taskEditorView = new TaskEditorView("task-editor", task, this._context.technologies, this._context, this._viewGroup)
        this._viewGroup.openView(taskEditorView)
    }

    @transaction
    createSolution(task: domain.Task): void {
        const solution = new domain.Solution(domain.Solution.NO_ID, task, "", null)
        const solutionEditorView = new SolutionEditorView("solution-editor", solution, this._context, this._viewGroup)
        this._viewGroup.openView(solutionEditorView)
    }

    @transaction
    runSolution(solutoin: domain.Solution): void {
        const solutionRunnerView = new SolutionRunner("solution-runner", solutoin, this, this._viewGroup)
        this._viewGroup.openView(solutionRunnerView)
    }
}
