import * as monaco from "monaco-editor"
import React from "react"
import { Monitor, options, standalone, Transaction, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { TaskEditorMainPanelContent, TaskEditorSidePanelContent } from "./TaskEditor.view"

export class TaskEditorView extends View {
    @unobservable readonly description: monaco.editor.ITextModel
    @unobservable readonly availableTechnologies: readonly domain.Technology[]
    @unobservable private static readonly s_monitor = Monitor.create("task-editor", 0, 0)
    @unobservable private readonly _id: number
    @unobservable private readonly _topic: domain.Topic
    @unobservable private readonly _solutions: domain.Solution[]
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _viewGroup: ViewGroup
    private _title: string
    private _selectedTechnologies: readonly domain.Technology[]

    override get isPulsing(): boolean { return TaskEditorView.s_monitor.isActive }
    get title(): string { return this._title }
    get selectedTechnologies(): readonly domain.Technology[] { return this._selectedTechnologies }

    constructor(task: domain.Task, availableTechnologies: readonly domain.Technology[], context: DatabaseContext, viewGroup: ViewGroup) {
        super()
        this._context = context
        this._viewGroup = viewGroup
        this._id = task.id
        this._topic = task.topic
        this._title = task.title
        this.description = standalone(() => monaco.editor.createModel(task.description, "markdown"))
        this._selectedTechnologies = task.technologies
        this.availableTechnologies = availableTechnologies
        this._solutions = task.solutions
    }

    override dispose(): void {
        Transaction.run(() => {
            standalone(() => this.description.dispose())
            super.dispose()
        })
    }

    override renderSidePanelContent(): JSX.Element {
        return <TaskEditorSidePanelContent model={this} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <TaskEditorMainPanelContent model={this} />
    }

    @transaction
    setTitle(title: string): void {
        this._title = title
    }

    @transaction
    setSelectedTechnologies(technologies: readonly domain.Technology[]): void {
        this._selectedTechnologies = technologies
    }

    @transaction
    @options({ monitor: TaskEditorView.s_monitor })
    async saveTask(): Promise<void> {
        const task = new domain.Task(this._id, this._topic, this._title, this.description.getValue(), this._selectedTechnologies)
        task.solutions = this._solutions
        if (this._id === domain.Task.NO_ID)
            await this._context.createTask(task)
        else
            await this._context.updateTask(task)
        this._viewGroup.returnToPreviousView()
    }

    @transaction
    cancelTaskEditing(): void {
        this._viewGroup.returnToPreviousView()
    }
}
