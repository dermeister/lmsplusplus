import { cached, monitor, Monitor, ObservableObject, reaction, transaction } from "reactronic"
import { Course } from "../domain/Course"
import { Task } from "../domain/Task"

export class TasksRepository extends ObservableObject {
  static readonly monitor = Monitor.create("Tasks monitor", 0, 0)
  private _courses: Course[] = []

  @cached
  get courses(): readonly Course[] {
    return this._courses
  }

  @transaction
  @monitor(TasksRepository.monitor)
  async delete(task: Task): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))
    this._courses.forEach(c => c.deleteTask(task))
  }

  @reaction
  @monitor(TasksRepository.monitor)
  private async synchronize(): Promise<void> {
    this._courses = await Promise.resolve([
      new Course("СПП", [new Task("Task 1"), new Task("Task 2")]),
      new Course("ЯП", [new Task("Task 1"), new Task("Task 2"), new Task("Task 3")]),
    ])
  }
}
