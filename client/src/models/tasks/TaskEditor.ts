import * as monaco from "monaco-editor"
import { cached, standalone, Transaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { ObservableObject } from "../../ObservableObject"

interface ConfirmedResult {
  readonly status: "saved"
  readonly task: Task
}

interface CanceledResult {
  readonly status: "canceled"
}

export class TaskEditor extends ObservableObject {
  private _editResult: ConfirmedResult | CanceledResult | null = null
  @unobservable private readonly id: number
  private _course: Course
  private _title: string
  private _description: monaco.editor.ITextModel

  @cached get editResult(): ConfirmedResult | CanceledResult | null { return this._editResult }
  @cached get title(): string { return this._title }
  @cached get description(): monaco.editor.ITextModel { return this._description }

  constructor(task: Task) {
    super()
    this.id = task.id
    this._title = task.title
    this._course = task.course
    this._description = monaco.editor.createModel(task.description, "markdown")
  }

  @transaction
  setTitle(title: string): void { this._title = title }

  @transaction
  save(): void {
    const task = new Task(this.id, this._course, this._title, this._description.getValue())
    this._editResult = { status: "saved", task }
  }

  @transaction
  cancel(): void { this._editResult = { status: "canceled" } }

  override dispose(): void {
    standalone(Transaction.run, () => {
      this._description.dispose()
      super.dispose()
    })
  }
}