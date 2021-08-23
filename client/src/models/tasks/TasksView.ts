import { Monitor, reaction, Transaction, unobservable } from "reactronic"
import { Task } from "../../domain/Task"
import { ObservableObject } from "../../ObservableObject"
import { TasksRepository } from "../../repositories"
import { SidePanel } from "../SidePanel"
import { TasksExplorer } from "./TasksExplorer"

export class TasksView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Tasks")
  @unobservable readonly rightPanel = new SidePanel("Edit task")
  @unobservable readonly explorer: TasksExplorer
  @unobservable private readonly repository: TasksRepository

  get monitor(): Monitor { return this.repository.monitor }
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

  constructor(repository: TasksRepository) {
    super()
    this.repository = repository
    this.explorer = new TasksExplorer(this.repository.courses)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.leftPanel.dispose()
      this.rightPanel.dispose()
      this.repository.dispose()
      this.explorer.dispose()
      super.dispose()
    })
  }

  @reaction
  private explorer_synchronized_with_repository(): void {
    this.explorer.updateCourses(this.repository.courses)
  }
}
