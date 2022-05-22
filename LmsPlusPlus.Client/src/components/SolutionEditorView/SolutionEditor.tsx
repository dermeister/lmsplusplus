import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { transaction, unobservable } from "reactronic"
import { View } from "../View"
import { SolutionEditorMainPanelContent, SolutionEditorSidePanelContent } from "./SolutionEditorView"
import React from "react"
import { DatabaseContext } from "../../database"
import { ViewGroup } from "../ViewGroup"

export class SolutionEditorView extends View {
    @unobservable readonly availableTechnologies: readonly domain.Technology[]
    @unobservable private readonly _id: number
    @unobservable private readonly _task: domain.Task
    @unobservable private readonly _viewGroup: ViewGroup
    private _name: string
    private _selectedTechnology: domain.Technology | null = null

    override get title(): string { return "Solution" }
    get name(): string { return this._name }
    get selectedTechnology(): domain.Technology | null { return this._selectedTechnology }

    constructor(id: string, solution: domain.Solution, context: DatabaseContext, viewGroup: ViewGroup) {
        super(id)
        this._id = solution.id
        this._task = solution.task
        this._name = solution.name
        this.availableTechnologies = this._task.technologies
        this._viewGroup = viewGroup
    }

    override renderSidePanelContent(): JSX.Element {
        return <SolutionEditorSidePanelContent model={this} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <SolutionEditorMainPanelContent model={this} />
    }

    @transaction
    setName(name: string): void {
        this._name = name
    }

    @transaction
    setTechnology(technology: domain.Technology): void {
        this._selectedTechnology = technology
    }

    @transaction
    saveSolution(): void { }

    @transaction
    cancelSolutionEditing(): void {
        this._viewGroup.closeView()
    }
}
