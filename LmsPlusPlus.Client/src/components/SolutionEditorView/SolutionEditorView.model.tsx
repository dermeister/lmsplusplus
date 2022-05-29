import React from "react"
import { isnonreactive, Monitor, options, transaction, Transaction } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IErrorService } from "../ErrorService"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import * as view from "./SolutionEditorView.view"

export class SolutionEditorView extends View {
    @isnonreactive readonly availableTechnologies: readonly domain.Technology[]
    @isnonreactive private static readonly s_monitor = Monitor.create("solution-editor-view", 0, 0, 0)
    @isnonreactive private readonly _id: number
    @isnonreactive private readonly _task: domain.Task
    @isnonreactive private readonly _viewGroup: ViewGroup
    @isnonreactive private readonly _errorService: IErrorService
    @isnonreactive private readonly _context: DatabaseContext
    private _name: string
    private _selectedTechnology: domain.Technology | null = null

    override get shouldShowLoader(): boolean { return SolutionEditorView.s_monitor.isActive }
    override get title(): string { return "Solution" }
    get name(): string { return this._name }
    get selectedTechnology(): domain.Technology | null { return this._selectedTechnology }

    constructor(solution: domain.Solution, context: DatabaseContext, viewGroup: ViewGroup, errorService: IErrorService) {
        super()
        this._context = context
        this._errorService = errorService
        this._id = solution.id
        this._task = solution.task
        this._name = solution.repositoryName
        this.availableTechnologies = this._task.technologies
        this._viewGroup = viewGroup
    }

    override renderSidePanelContent(): JSX.Element {
        return <view.SolutionEditorSidePanelContent solutionEditorView={this} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <view.SolutionEditorMainPanelContent />
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
        const solution = new domain.Solution(this._id, this._task, this._name)
        if (!this._selectedTechnology)
            this._errorService.showError(new Error("No technology selected."))
        else
            try {
                await this._context.createSolution(solution, this._selectedTechnology)
                this._viewGroup.returnToPreviousView()
            } catch (error) {
                Transaction.off(() => {
                    if (error instanceof Error)
                        this._errorService.showError(error)
                })
            }
    }

    @transaction
    cancelSolutionEditing(): void {
        this._viewGroup.returnToPreviousView()
    }
}
