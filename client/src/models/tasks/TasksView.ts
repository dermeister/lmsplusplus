import { cached, Monitor, reaction, unobservable } from "reactronic"
import { Task } from "../../domain/Task"
import { ObservableObject } from "../../ObservableObject"
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
  @cached get selectedTask(): Task | null { return this.explorer.selectedTask }

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
    if (this.explorer.courseToCreateTaskIn) {
      this._taskEditor?.dispose()
      const task = new Task(Task.NO_ID, this.explorer.courseToCreateTaskIn, "", "")
      this._taskEditor = new TaskEditor(task)
    }
  }

  @reaction
  private editTask(): void {
    if (this.explorer.taskToEdit) {
      this._taskEditor?.dispose()
      this._taskEditor = new TaskEditor(this.explorer.taskToEdit)
    }
  }

  @reaction
  private disposeTaskEditor(): void {
    if (!this.explorer.taskToEdit && !this.explorer.courseToCreateTaskIn) {
      this.taskEditor?.dispose()
      this._taskEditor = null
    }
  }

  @reaction
  private async deleteTask(): Promise<void> {
    if (this.explorer.taskToDelete) {
      await this.tasksRepository.delete(this.explorer.taskToDelete)
      this.explorer.reset()
    }
  }

  @reaction
  private async saveCreatedTask(): Promise<void> {
    const editResult = this._taskEditor?.editResult
    if (this.explorer.courseToCreateTaskIn)
      switch (editResult?.status) {
        case "saved":
          await this.tasksRepository.create(editResult.task)
          this.explorer.reset()
          break
        case "canceled":
          this.explorer.reset()
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
          this.explorer.reset()
          break
        case "canceled":
          this.explorer.reset()
          break
      }
  }
}
