import React from "react"
import { isnonreactive, Monitor, options, transaction, Transaction } from "reactronic"
import { AppError } from "../../AppError"
import { DatabaseContext } from "../../api"
import * as domain from "../../domain"
import { IMessageService } from "../MessageService"
import { handleError } from "../utils"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import * as view from "./SolutionEditorView.view"

export class SolutionEditorView extends View {
    @isnonreactive readonly availableTechnologies: readonly domain.Technology[]
    @isnonreactive private static readonly s_monitor = Monitor.create("solution-editor-view", 0, 0, 0)
    @isnonreactive private readonly _id: number
    @isnonreactive private readonly _task: domain.Task
    @isnonreactive private readonly _viewGroup: ViewGroup
    @isnonreactive private readonly _messageService: IMessageService
    @isnonreactive private readonly _context: DatabaseContext
    @isnonreactive private readonly _cloneUrl: string | null
    @isnonreactive private readonly _websiteUrl: string | null
    private _repositoryName: string | null
    private _selectedTechnology: domain.Technology | null = null

    override get shouldShowLoader(): boolean { return SolutionEditorView.s_monitor.isActive }
    override get title(): string { return "Solution" }
    get repositoryName(): string { return this._repositoryName ?? "" }
    get selectedTechnology(): domain.Technology | null { return this._selectedTechnology }

    constructor(solution: domain.Solution, context: DatabaseContext, viewGroup: ViewGroup, messageService: IMessageService) {
        super()
        this._context = context
        this._messageService = messageService
        this._id = solution.id
        this._task = solution.task
        this._repositoryName = solution.repositoryName
        this._cloneUrl = solution.cloneUrl
        this._websiteUrl = solution.websiteUrl
        this.availableTechnologies = this._task.technologies
        this._viewGroup = viewGroup
    }

    override renderSidePanelContent(): JSX.Element {
        return <view.SolutionEditorSidePanelContent view={this} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <view.SolutionEditorMainPanelContent />
    }

    @transaction
    setRepositoryName(name: string): void {
        this._repositoryName = name
    }

    @transaction
    setTechnology(technology: domain.Technology): void {
        this._selectedTechnology = technology
    }

    @transaction
    @options({ monitor: SolutionEditorView.s_monitor })
    async saveSolution(): Promise<void> {
        const solution = new domain.Solution(this._id, this._task, this._repositoryName, this._cloneUrl, this._websiteUrl)
        if (!this._selectedTechnology)
            this._messageService.showError(new AppError("Cannot create solution.", "No technology selected."))
        else
            try {
                await this._context.createSolution(solution, this._selectedTechnology)
                this._viewGroup.returnToPreviousView()
            } catch (e) {
                Transaction.off(() => handleError(e, this._messageService))
            }
    }

    @transaction
    cancelSolutionEditing(): void {
        this._viewGroup.returnToPreviousView()
    }
}
