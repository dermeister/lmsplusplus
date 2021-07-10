import { cached, Monitor, ObservableObject, reaction, unobservable } from "reactronic"
import { TasksRepository } from "../../repositories/TasksRepository"
import { SidePanel } from "../SidePanel"
import { TasksExplorer } from "../tasks/TasksExplorer"
import { TaskEditor } from "./TaskEditor"

export class TasksView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Tasks")
  @unobservable readonly rightPanel = new SidePanel("Edit task")
  @unobservable readonly tasksRepository = new TasksRepository()
  @unobservable readonly explorer = new TasksExplorer(this.tasksRepository.courses)
  private _taskEditor: TaskEditor | null = null

  get monitor(): Monitor { return TasksRepository.monitor }
  @cached get taskEditor(): TaskEditor | null { return this._taskEditor }

  @reaction
  private updateExplorer(): void { this.explorer.updateCourses(this.tasksRepository.courses) }

  @reaction
  private createTask(): void {
    if (this.explorer.taskToCreate !== null)
      this._taskEditor = new TaskEditor(this.explorer.taskToCreate)
    else
      this._taskEditor = null
  }

  @reaction
  private updateTask(): void {
    if (this.explorer.taskToUpdate !== null)
      this._taskEditor = new TaskEditor(this.explorer.taskToUpdate)
    else
      this._taskEditor = null
  }

  @reaction
  private async deleteTask(): Promise<void> {
    if (this.explorer.taskToDelete !== null) {
      await this.tasksRepository.delete(this.explorer.taskToDelete)
      this.explorer.completeTaskDeletion()
    }
  }

  @reaction
  private async persistTask(): Promise<void> {
    const editedTask = this._taskEditor?.editedTask
    if (editedTask)
      if (editedTask.id === null) {
        this.tasksRepository.create(editedTask)
        this.explorer.completeTaskCreation()
      } else {
        this.tasksRepository.update(editedTask)
        this.explorer.completeTaskUpdate()
      }
  }
}
