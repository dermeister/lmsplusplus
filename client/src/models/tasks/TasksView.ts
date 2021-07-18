import { cached, Monitor, reaction, standalone, throttling, Transaction, unobservable } from "reactronic"
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
  private taskEditorToDispose: TaskEditor | null = null

  get monitor(): Monitor { return TasksRepository.monitor }
  @cached get taskEditor(): TaskEditor | null { return this._taskEditor }
  @cached get selectedTask(): Task | null { return this.explorer.selectedTask }

  override dispose(): void {
    Transaction.run(() => {
      this.leftPanel.dispose()
      this.rightPanel.dispose()
      this.tasksRepository.dispose()
      this.explorer.dispose()
      this._taskEditor?.dispose()
      super.dispose()
    })
  }

  @reaction
  private updateExplorer(): void {
    this.explorer.updateCourses(this.tasksRepository.courses)
  }

  @reaction
  private createTask(): void {
    const { courseToCreateTaskIn } = this.explorer
    if (courseToCreateTaskIn) {
      this.markCurrentTaskEditorToDispose()
      const task = new Task(Task.NO_ID, courseToCreateTaskIn, "", "")
      this._taskEditor = new TaskEditor(task)
    }
  }

  @reaction
  private editTask(): void {
    const { taskToEdit } = this.explorer
    if (taskToEdit) {
      this.markCurrentTaskEditorToDispose()
      this._taskEditor = new TaskEditor(taskToEdit)
    }
  }

  @reaction
  private async deleteTask(): Promise<void> {
    const { taskToDelete } = this.explorer
    if (taskToDelete) {
      await this.tasksRepository.delete(taskToDelete)
      this.explorer.setTaskToDelete(null)
    }
  }

  @reaction
  private async saveTask(): Promise<void> {
    const editResult = this._taskEditor?.editResult
    switch (editResult?.status) {
      case "saved":
        if (this.explorer.courseToCreateTaskIn)
          await this.tasksRepository.create(editResult.task)
        else if (this.explorer.taskToEdit)
          await this.tasksRepository.update(editResult.task)
        this.resetExplorerCreateAndEditTasks()
        break
      case "canceled":
        this.resetExplorerCreateAndEditTasks()
        break
    }
  }

  @reaction
  private markTaskEditorToDisposeAfterResettingExplorer(): void {
    if (!this.explorer.courseToCreateTaskIn && !this.explorer.taskToEdit)
      this.markCurrentTaskEditorToDispose()
  }

  @reaction @throttling(0)
  private disposeTaskEditor(): void {
    if (this.taskEditorToDispose)
      standalone(Transaction.run, () => {
        this.taskEditorToDispose?.dispose()
        this.taskEditorToDispose = null
      })
  }

  private markCurrentTaskEditorToDispose(): void {
    this.taskEditorToDispose = this._taskEditor
    this._taskEditor = null
  }

  private resetExplorerCreateAndEditTasks(): void {
    this.explorer.setCourseToCreateTaskIn(null)
    this.explorer.setTaskToEdit(null)
    this.markCurrentTaskEditorToDispose()
  }
}
