import { Monitor, reaction, standalone, throttling, Transaction, unobservable } from "reactronic"
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
  get taskEditor(): TaskEditor | null { return this._taskEditor }
  get selectedTask(): Task | null { return this.explorer.selectedTask }

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
  private explorer_synchronized_with_repository_courses(): void {
    this.explorer.updateCourses(this.tasksRepository.courses)
  }

  @reaction
  private taskEditor_created_on_courseToCreateTaskIn(): void {
    const { courseToCreateTaskIn } = this.explorer
    if (courseToCreateTaskIn) {
      this.markCurrentTaskEditorToDispose()
      const task = new Task(Task.NO_ID, courseToCreateTaskIn, "", "")
      this.createTaskEditor(task)
    }
  }

  @reaction
  private taskEditor_created_on_taskToEdit(): void {
    const { taskToEdit } = this.explorer
    if (taskToEdit) {
      this.markCurrentTaskEditorToDispose()
      this.createTaskEditor(taskToEdit)
    }
  }

  @reaction
  private async task_deleted_on_taskToDelete(): Promise<void> {
    const { taskToDelete } = this.explorer
    if (taskToDelete) {
      await standalone(Transaction.run, async () => {
        await this.tasksRepository.delete(taskToDelete)
        this.explorer.setTaskToDelete(null)
      })
    }
  }

  @reaction
  private taskEditor_marked_to_dispose_if_no_courseToCreateTaskIn_or_taskToEdit_set(): void {
    if (!this.explorer.courseToCreateTaskIn && !this.explorer.taskToEdit && this._taskEditor)
      this.markCurrentTaskEditorToDispose()
  }

  @reaction
  private async task_persisted_in_repository_on_taskEditor_editResult(): Promise<void> {
    const editResult = this._taskEditor?.editResult
    await standalone(Transaction.run, async () => {
      switch (editResult?.status) {
        case "saved":
          if (this.explorer.courseToCreateTaskIn)
            await this.tasksRepository.create(editResult.task)
          else if (this.explorer.taskToEdit)
            await this.tasksRepository.update(editResult.task)
          this.resetCourseToCreateTaskInAndTaskToEdit()
          break
        case "canceled":
          this.resetCourseToCreateTaskInAndTaskToEdit()
          break
      }
    })
  }

  @reaction @throttling(0)
  private taskEditorToDispose_disposed(): void {
    if (this.taskEditorToDispose)
      standalone(Transaction.run, () => {
        this.taskEditorToDispose?.dispose()
        this.taskEditorToDispose = null
      })
  }

  private createTaskEditor(task: Task): void {
    this._taskEditor = new TaskEditor(task)
    this.rightPanel.open()
  }

  private markCurrentTaskEditorToDispose(): void {
    this.taskEditorToDispose = this._taskEditor
    this._taskEditor = null
  }

  private resetCourseToCreateTaskInAndTaskToEdit(): void {
    this.explorer.setCourseToCreateTaskIn(null)
    this.explorer.setTaskToEdit(null)
  }
}
