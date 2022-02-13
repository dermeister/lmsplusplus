import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { transaction, unobservable } from "reactronic"

export class SolutionEditor extends ObservableObject {
    @unobservable readonly availableTechnologies: readonly domain.Technology[]
    @unobservable private readonly _id: number
    @unobservable private readonly _task: domain.Task
    private _name: string
    private _selectedTechnology: domain.Technology | null = null

    get name(): string { return this._name }
    get selectedTechnology(): domain.Technology | null { return this._selectedTechnology }

    constructor(solution: domain.Solution) {
        super()
        this._id = solution.id
        this._task = solution.task
        this._name = solution.name
        this.availableTechnologies = this._task.technologies
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
    getSolution(): domain.Solution {
        return new domain.Solution(this._id, this._task, this._name, this._selectedTechnology)
    }
}
