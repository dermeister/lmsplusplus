import { ObservableObject } from "../../ObservableObject"
import { standalone, transaction, Transaction, unobservable } from "reactronic"
import * as monaco from "monaco-editor"
import * as domain from "../../domain"
import { View } from "../View"
import { DatabaseContext } from "../../database"
import { ViewGroup } from "../ViewGroup"
import { TaskEditorMainPanelContent, TaskEditorSidePanelContent } from "./TaskEditorView"
import React from "react"

export class TaskEditorView extends View {

    @unobservable readonly description: monaco.editor.ITextModel
    @unobservable readonly availableTechnologies: readonly domain.Technology[]
    @unobservable private readonly _id: number
    @unobservable private readonly _topic: domain.Topic
    @unobservable private readonly _solutions: domain.Solution[]
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _viewGroup: ViewGroup
    private _title: string
    private _selectedTechnologies: readonly domain.Technology[]

    get title(): string { return this._title }
    get selectedTechnologies(): readonly domain.Technology[] { return this._selectedTechnologies }

    constructor(id: string, task: domain.Task, availableTechnologies: readonly domain.Technology[], context: DatabaseContext, viewGroup: ViewGroup) {
        super(id)
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

    // override dispose(): void {
    //     Transaction.run(() => {
    //         standalone(() => this.description.dispose())
    //         super.dispose()
    //     })
    // }

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
    saveTask(): void { }

    @transaction
    cancelTaskEditing(): void {
        this._viewGroup.closeView()
    }
}
