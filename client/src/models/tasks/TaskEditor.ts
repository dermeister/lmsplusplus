import { cached, transaction, unobservable } from "reactronic"
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
  private _description: string

  @cached get editResult(): ConfirmedResult | CanceledResult | null { return this._editResult }
  @cached get title(): string { return this._title }

  constructor(task: Task) {
    super()
    this.id = task.id
    this._title = task.title
    this._course = task.course
    this._description = task.description
  }

  @transaction
  setTitle(title: string): void { this._title = title }

  @transaction
  save(): void {
    const task = new Task(this.id, this._course, this._title, this._description)
    this._editResult = { status: "saved", task }
  }

  @transaction
  cancel(): void { this._editResult = { status: "canceled" } }
}