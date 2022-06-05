import * as monaco from "monaco-editor"
import React from "react"
import { cached, isnonreactive, Monitor, options, Transaction, transaction } from "reactronic"
import { Storage } from "../../api"
import * as domain from "../../domain"
import { IMessageService } from "../MessageService"
import { IThemeService } from "../ThemeService"
import { handleError } from "../utils"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import * as view from "./TaskEditorView.view"

export class TaskEditorView extends View {
    @isnonreactive readonly availableTechnologies: readonly domain.Technology[]
    @isnonreactive readonly description: monaco.editor.ITextModel
    @isnonreactive private static readonly _monitor = Monitor.create("task-editor-view", 0, 0, 0)
    @isnonreactive private readonly _themeService: IThemeService
    @isnonreactive private readonly _id: number
    @isnonreactive private readonly _topic: domain.Topic
    @isnonreactive private readonly _solutions: domain.Solution[]
    @isnonreactive private readonly _storage: Storage
    @isnonreactive private readonly _viewGroup: ViewGroup
    @isnonreactive private readonly _messageService: IMessageService
    private _taskTitle: string
    private _selectedTechnologies: readonly domain.Technology[]

    override get shouldShowLoader(): boolean { return TaskEditorView._monitor.isActive }
    override get title(): string { return "Task Editor" }
    get taskTitle(): string { return this._taskTitle }
    get selectedTechnologies(): readonly domain.Technology[] { return this._selectedTechnologies }
    get editorTheme(): string { return this._themeService.theme }

    constructor(task: domain.Task, availableTechnologies: readonly domain.Technology[], storage: Storage, viewGroup: ViewGroup,
        messageService: IMessageService, themeService: IThemeService) {
        super()
        this._messageService = messageService
        this._storage = storage
        this._viewGroup = viewGroup
        this._id = task.id
        this._topic = task.topic
        this._taskTitle = task.title
        this.description = Transaction.off(() => monaco.editor.createModel(task.description, "markdown"))
        this._selectedTechnologies = task.technologies
        this.availableTechnologies = availableTechnologies
        this._solutions = task.solutions
        this._themeService = themeService
    }

    override dispose(): void {
        Transaction.run(null, () => {
            Transaction.off(() => this.description.dispose())
            super.dispose()
        })
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <view.TaskEditorSidePanelContent view={this} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        return <view.TaskEditorMainPanelContent view={this} />
    }

    @transaction
    setTaskTitle(title: string): void {
        this._taskTitle = title
    }

    @transaction
    setSelectedTechnologies(technologies: readonly domain.Technology[]): void {
        this._selectedTechnologies = technologies
    }

    @transaction
    @options({ monitor: TaskEditorView._monitor })
    async saveTask(): Promise<void> {
        const task = new domain.Task(this._id, this._topic, this._taskTitle, this.description.getValue(), this._selectedTechnologies)
        task.solutions = this._solutions
        try {
            if (this._id === domain.Task.NO_ID)
                await this._storage.createTask(task)
            else
                await this._storage.updateTask(task)
            this._viewGroup.returnToPreviousView()
        } catch (error) {
            Transaction.off(() => handleError(error, this._messageService))
        }
    }

    @transaction
    cancelTaskEditing(): void {
        this._viewGroup.returnToPreviousView()
    }
}
