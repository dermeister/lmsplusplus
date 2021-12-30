import { Course } from "./Course"
import { Solution } from "./Solution"

export class Task {
    static readonly NO_ID = -1
    readonly id: number
    readonly course: Course
    readonly title: string
    readonly description: string
    private _solutions: readonly Solution[] = []
    private solutionsInitialized = false

    get solutions(): readonly Solution[] {
        if (!this.solutionsInitialized)
            throw new Error("Task solutions have not been initialized")
        return this._solutions
    }
    set solutions(solutions: readonly Solution[]) {
        if (!this.solutionsInitialized) {
            this._solutions = solutions
            this.solutionsInitialized = true
        } else
            throw new Error("Task tasks have already been initialized")
    }

    constructor(id: number, course: Course, title: string, description: string) {
        this.id = id
        this.course = course
        this.title = title
        this.description = description
    }
}
