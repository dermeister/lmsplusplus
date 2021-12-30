import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { transaction, unobservable } from "reactronic"

export class SolutionEditor extends ObservableObject {
    @unobservable private readonly id: number
    @unobservable private readonly task: domain.Task
    private _name: string

    get name(): string { return this._name }

    constructor(solution: domain.Solution) {
        super()
        this.id = solution.id
        this.task = solution.task
        this._name = solution.name
    }

    @transaction
    setName(name: string): void {
        this._name = name
    }

    @transaction
    getSolution(): domain.Solution {
        return new domain.Solution(this.id, this.task, this._name)
    }
}
