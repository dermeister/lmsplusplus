import { Task } from "./Task"

export class Course {
  readonly name: string
  private _tasks: readonly Task[] = []
  private tasksInitialized = false

  get tasks(): readonly Task[] { return this._tasks }
  set tasks(tasks: readonly Task[]) {
    if (!this.tasksInitialized)
      this._tasks = tasks
    else
      throw new Error("Course tasks have already been initialized");
  }

  constructor(name: string) { this.name = name }
}
