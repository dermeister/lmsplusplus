import { Course } from "./Course"
import { Solution } from "./Solution"

export class Task {
    static readonly NO_ID = -1
    readonly id: number
    readonly course: Course
    readonly title: string
    readonly description: string
    readonly technologies: readonly string[]
    private _solutions: readonly Solution[] = []
    private _solutionsInitialized = false

    get solutions(): readonly Solution[] {
        if (!this._solutionsInitialized)
            throw new Error("Task solutions have not been initialized")
        return this._solutions
    }
    set solutions(solutions: readonly Solution[]) {
        if (!this._solutionsInitialized) {
            this._solutions = solutions
            this._solutionsInitialized = true
        } else
            throw new Error("Task tasks have already been initialized")
    }

    constructor(id: number, course: Course, title: string, description: string, technologies: readonly string[]) {
        this.id = id
        this.course = course
        this.title = title
        this.description = description
        this.technologies = technologies
    }
}
