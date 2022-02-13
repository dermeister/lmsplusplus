import { Topic } from "./Topic"
import { Solution } from "./Solution"
import { Technology } from "./Technology"

export class Task {
    static readonly NO_ID = -1
    readonly id: number
    readonly topic: Topic
    readonly title: string
    readonly description: string
    readonly technologies: readonly Technology[]
    private _solutions: Solution[] = []

    get solutions(): Solution[] { return this._solutions }
    set solutions(solutions: Solution[]) { this._solutions = solutions }

    constructor(id: number, topic: Topic, title: string, description: string, technologies: readonly Technology[]) {
        this.id = id
        this.topic = topic
        this.title = title
        this.description = description
        this.technologies = technologies
    }
}
