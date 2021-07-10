import { Monitor, ObservableObject, reaction, unobservable } from "reactronic"
import { TasksRepository } from "../../repositories/TasksRepository"
import { SidePanel } from "../SidePanel"
import { TasksExplorer } from "../tasks/TasksExplorer"

export class TasksView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Tasks")
  @unobservable readonly tasksRepository = new TasksRepository()
  @unobservable readonly explorer = new TasksExplorer(this.tasksRepository.courses)

  get monitor(): Monitor {
    return TasksRepository.monitor
  }

  @reaction
  private updateExplorer(): void {
    this.explorer.updateCourses(this.tasksRepository.courses)
  }

  @reaction
  private taskDeleted(): void {
    if (this.explorer.taskToDelete !== null) {
      this.tasksRepository.delete(this.explorer.taskToDelete)
    }
  }
}
