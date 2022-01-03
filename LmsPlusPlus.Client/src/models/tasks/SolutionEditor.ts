import { ObservableObject } from "../../ObservableObject"
import * as domain from "../../domain"
import { transaction, unobservable } from "reactronic"

export class SolutionEditor extends ObservableObject {
    @unobservable private readonly _id: number
    @unobservable private readonly _task: domain.Task
    private _name: string

    get name(): string { return this._name }

    constructor(solution: domain.Solution) {
        super()
        this._id = solution.id
        this._task = solution.task
        this._name = solution.name
    }

    @transaction
    setName(name: string): void {
        this._name = name
    }

    @transaction
    getSolution(): domain.Solution {
        return new domain.Solution(this._id, this._task, this._name)
    }
}
