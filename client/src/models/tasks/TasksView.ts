import { cached, Monitor, reaction, unobservable } from "reactronic"
import { Task } from "../../domain/Task"
import { TasksRepository } from "../../repositories/TasksRepository"
import { ObservableObject } from "../../ObservableObject"
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

  dispose(): void {
    this.leftPanel.dispose()
    this.rightPanel.dispose()
    this.tasksRepository.dispose()
    this.explorer.dispose()
    this._taskEditor?.dispose()
    super.dispose()
  }

  @reaction
  private updateExplorer(): void { this.explorer.updateCourses(this.tasksRepository.courses) }

  @reaction
  private createTask(): void {
    if (this.explorer.courseToCreateTaskIn)
      this._taskEditor = new TaskEditor(new Task(Task.NO_ID, this.explorer.courseToCreateTaskIn, "", ""))
  }

  @reaction
  private editTask(): void {
    if (this.explorer.taskToEdit)
      this._taskEditor = new TaskEditor(this.explorer.taskToEdit)
  }

  @reaction
  private disposeTaskEditor(): void {
    if (!(this.explorer.taskToEdit || this.explorer.courseToCreateTaskIn)) {
      this.taskEditor?.dispose()
      this._taskEditor = null
    }
  }

  @reaction
  private async deleteTask(): Promise<void> {
    if (this.explorer.taskToDelete) {
      await this.tasksRepository.delete(this.explorer.taskToDelete)
      this.explorer.setTaskToDelete(null)
    }
  }

  @reaction
  private async saveCreatedTask(): Promise<void> {
    const editResult = this._taskEditor?.editResult
    if (this.explorer.courseToCreateTaskIn)
      switch (editResult?.status) {
        case "saved":
          await this.tasksRepository.create(editResult.task)
          this.explorer.setCourseToCreateTaskIn(null)
          break
        case "canceled":
          this.explorer.setCourseToCreateTaskIn(null)
          break
      }
  }

  @reaction
  private async saveEditedTask(): Promise<void> {
    const editResult = this._taskEditor?.editResult
    if (this.explorer.taskToEdit)
      switch (editResult?.status) {
        case "saved":
          await this.tasksRepository.update(editResult.task)
          this.explorer.setTaskToEdit(null)
          break
        case "canceled":
          this.explorer.setTaskToEdit(null)
          break
      }
  }
}
