import { ObservableObject } from "../../ObservableObject"
import { standalone, transaction, Transaction, unobservable } from "reactronic"
import * as monaco from "monaco-editor"
import * as domain from "../../domain"

export class TaskEditor extends ObservableObject {
    @unobservable readonly description: monaco.editor.ITextModel
    @unobservable private readonly id: number
    @unobservable private readonly course: domain.Course
    @unobservable private readonly solutions: readonly domain.Solution[]
    private _title: string

    get title(): string { return this._title }

    constructor(task: domain.Task) {
        super()
        this.id = task.id
        this.course = task.course
        this._title = task.title
        this.description = standalone(() => monaco.editor.createModel(task.description, "markdown"))
        this.solutions = task.solutions
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
    getTask(): domain.Task {
        const task = new domain.Task(this.id, this.course, this._title, this.description.getValue())
        task.solutions = this.solutions
        return task
    }
}
