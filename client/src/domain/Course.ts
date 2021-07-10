import { cached, ObservableObject, transaction } from "reactronic"
import { Task } from "./Task"

export class Course extends ObservableObject {
  private _name: string
  private _tasks: Task[]

  @cached get name(): string { return this._name }
  @cached get tasks(): readonly Task[] { return this._tasks }

  constructor(name: string, tasks: Task[]) {
    super()
    this._name = name
    this._tasks = tasks
  }

  @transaction
  deleteTask(task: Task): void {
    this._tasks = this._tasks.filter(t => t !== task)
  }
}
