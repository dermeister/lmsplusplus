import { ObservableObject } from "../../ObservableObject"
import { standalone, transaction, Transaction, unobservable } from "reactronic"
import * as monaco from "monaco-editor"
import * as domain from "../../domain"

export class TaskEditor extends ObservableObject {
    @unobservable readonly description: monaco.editor.ITextModel
    @unobservable readonly availableTechnologies: readonly domain.Technology[]
    @unobservable private readonly _id: number
    @unobservable private readonly _topic: domain.Topic
    @unobservable private readonly _solutions: domain.Solution[]
    private _title: string
    private _selectedTechnologies: readonly domain.Technology[]

    get title(): string { return this._title }
    get selectedTechnologies(): readonly domain.Technology[] { return this._selectedTechnologies }

    constructor(task: domain.Task, availableTechnologies: readonly domain.Technology[]) {
        super()
        this._id = task.id
        this._topic = task.topic
        this._title = task.title
        this.description = standalone(() => monaco.editor.createModel(task.description, "markdown"))
        this._selectedTechnologies = task.technologies
        this.availableTechnologies = availableTechnologies
        this._solutions = task.solutions
    }

    override dispose(): void {
        Transaction.run(() => {
            standalone(() => this.description.dispose())
            super.dispose()
        })
    }

    @transaction
    setTitle(title: string): void {
        this._title = title
    }

    @transaction
    setSelectedTechnologies(technologies: readonly domain.Technology[]): void {
        this._selectedTechnologies = technologies
    }

    @transaction
    getTask(): domain.Task {
        const task = new domain.Task(this._id, this._topic, this._title, this.description.getValue(), this._selectedTechnologies)
        task.solutions = this._solutions
        return task
    }
}
