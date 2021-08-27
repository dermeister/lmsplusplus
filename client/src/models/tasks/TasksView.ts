import { Monitor, transaction, Transaction, unobservable } from "reactronic"
import { Disposable } from "../../Disposable"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Database } from "../../repositories"
import { SidePanel } from "../SidePanel"
import { TasksExplorer } from "./TasksExplorer"

export class TasksView implements Disposable {
  @unobservable readonly leftPanel = new SidePanel("Tasks")
  @unobservable readonly rightPanel = new SidePanel("Edit task")
  @unobservable readonly explorer: TasksExplorer

  get monitor(): Monitor { return Database.monitor }
  get createdTask(): Task | null {
    const task = this.explorer.editedTask
    if (task?.id !== Task.NO_ID)
      return null
    return task
  }
  get updatedTask(): Task | null {
    const task = this.explorer.editedTask
    if (!task || task.id === Task.NO_ID)
      return null
    return task
  }
  get deletedTask(): Task | null { return this.explorer.deletedTask }

  constructor(courses: readonly Course[]) {
    this.explorer = new TasksExplorer(courses)
  }

  dispose(): void {
    Transaction.run(() => {
      this.leftPanel.dispose()
      this.rightPanel.dispose()
      this.explorer.dispose()
    })
  }

  @transaction
  update(courses: readonly Course[]): void {
    this.explorer.updateCourses(courses)
  }
}
