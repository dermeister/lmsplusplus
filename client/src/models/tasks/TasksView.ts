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
    let task: Task | null = null
    const { courseToCreateTaskAt } = this.explorer
    if (courseToCreateTaskAt)
      task = new Task(null, courseToCreateTaskAt, "", "")
    this.createOrDisposeTaskEditor(task)
  }

  @reaction
  private editTask(): void { this.createOrDisposeTaskEditor(this.explorer.taskToEdit) }

  private createOrDisposeTaskEditor(task: Task | null): void {
    if (task)
      this._taskEditor = new TaskEditor(task)
    else {
      this._taskEditor?.dispose()
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
  private async saveTask(): Promise<void> {
    const editedTask = this._taskEditor?.editedTask
    if (editedTask)
      if (!editedTask.id) {
        this.tasksRepository.create(editedTask)
        this.explorer.setCoursesToCreateTaskAt(null)
      } else {
        this.tasksRepository.update(editedTask)
        this.explorer.setTaskToEdit(null)
      }
  }
}
