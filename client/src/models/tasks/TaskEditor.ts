import { cached, ObservableObject, transaction, unobservable } from "reactronic";
import { Course } from "../../domain/Course";
import { Task } from "../../domain/Task";

export class TaskEditor extends ObservableObject {
  private _editedTask: Task | null = null
  @unobservable private readonly id: number | null
  private _course: Course
  private _title: string
  private _description: string

  @cached get editedTask(): Task | null { return this._editedTask }
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
  save(): void { this._editedTask = new Task(this.id, this._course, this._title, this._description) }
}