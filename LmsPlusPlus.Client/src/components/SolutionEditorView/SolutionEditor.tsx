import React from "react"
import { Monitor, options, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { SolutionEditorMainPanelContent, SolutionEditorSidePanelContent } from "./SolutionEditorView"

export class SolutionEditorView extends View {
    @unobservable readonly availableTechnologies: readonly domain.Technology[]
    @unobservable private static readonly s_monitor = Monitor.create("solution-editor-view", 0, 0)
    @unobservable private readonly _id: number
    @unobservable private readonly _task: domain.Task
    @unobservable private readonly _viewGroup: ViewGroup
    @unobservable private readonly _context: DatabaseContext
    private _name: string
    private _selectedTechnology: domain.Technology | null = null

    override get isPulsing(): boolean { return SolutionEditorView.s_monitor.isActive }
    override get title(): string { return "Solution" }
    get name(): string { return this._name }
    get selectedTechnology(): domain.Technology | null { return this._selectedTechnology }

    constructor(solution: domain.Solution, context: DatabaseContext, viewGroup: ViewGroup) {
        super()
        this._context = context
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
    @options({ monitor: SolutionEditorView.s_monitor })
    async saveSolution(): Promise<void> {
        const solution = new domain.Solution(this._id, this._task, this._name, this._selectedTechnology)
        await this._context.createSolution(solution)
        this._viewGroup.returnToPreviousView()
    }

    @transaction
    cancelSolutionEditing(): void {
        this._viewGroup.returnToPreviousView()
    }
}
