import { Monitor, reaction, transaction, Transaction, unobservable } from "reactronic"
import { ReadOnlyDatabase } from "../../database"
import { Task } from "../../domain/Task"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { DemoExplorer } from "./DemoExplorer"
import { TaskEditorView } from "./TaskEditorView"
import { TasksExplorer } from "./TasksExplorer"
import { TasksView } from "./TasksView"

export class MainView extends View {
  @unobservable readonly database: ReadOnlyDatabase
  @unobservable readonly tasksExplorer: TasksExplorer
  @unobservable readonly demoExplorer: DemoExplorer
  @unobservable readonly tasksView: TasksView
  @unobservable readonly subViews: ViewGroup
  private _taskEditorView: TaskEditorView | null = null
  private disposedView: View | null = null
  private _createdTask: Task | null = null
  private _updatedTask: Task | null = null
  private _deletedTask: Task | null = null

  get monitor(): Monitor { return this.database.monitor }
  get taskEditorView(): TaskEditorView | null { return this._taskEditorView }
  get createdTask(): Task | null { return this._createdTask }
  get updatedTask(): Task | null { return this._updatedTask }
  get deletedTask(): Task | null { return this._deletedTask }

  constructor(database: ReadOnlyDatabase) {
    super("Main")
    this.database = database
    this.tasksExplorer = new TasksExplorer(database.courses)
    this.demoExplorer = new DemoExplorer([])
    this.tasksView = new TasksView(this.database)
    this.subViews = new ViewGroup([this.tasksView], this.tasksView)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.tasksExplorer.dispose()
      this.demoExplorer.dispose()
      this.tasksView.dispose()
      this.subViews.dispose()
      this._taskEditorView?.dispose()
      super.dispose()
    })
  }

  @reaction
  private taskEditorView_created_on_editedTask(): void {
    if (this.tasksView.editedTask)
      this.createTaskEditorView(this.tasksView.editedTask)
  }

  @reaction
  private deletedTask_propagated(): void {
    if (this.tasksView.deletedTask)
      this._deletedTask = this.tasksView.deletedTask
  }

  @reaction
  private tasksView_deletedTask_reset_after_being_stored_in_local_field(): void {
    if (this._deletedTask)
      this.tasksView.setDeletedTask(null)
  }

  @transaction
  private createTaskEditorView(task: Task): void {
    this._taskEditorView = new TaskEditorView(task)
    this.subViews.addView(this._taskEditorView)
    this.subViews.setActiveView(this._taskEditorView)
    this.subViews.removeView(this.tasksView)
  }

  @reaction
  private taskEditorView_removed_on_cancel(): void {
    if (this._taskEditorView?.createdTask) {
      this._createdTask = this._taskEditorView.createdTask
      this.removeTaskEditorViewFromViewGroupAndDispose()
    }
    if (this._taskEditorView?.updatedTask) {
      this._updatedTask = this._taskEditorView.updatedTask
      this.removeTaskEditorViewFromViewGroupAndDispose()
    }
    if (this._taskEditorView?.editingCanceled)
      this.removeTaskEditorViewFromViewGroupAndDispose()
  }

  private removeTaskEditorViewFromViewGroupAndDispose(): void {
    Transaction.runAs({ standalone: true }, () => {
      this.subViews.addView(this.tasksView)
      this.subViews.setActiveView(this.tasksView)
      this.subViews.removeView(this._taskEditorView as View)
      this.disposedView = this._taskEditorView
      this._taskEditorView = null
      this.tasksView.updateTask(null)
    })
  }

  @reaction
  private disposedTaskEditorView_disposed(): void {
    if (this.disposedView) {
      Transaction.runAs({ standalone: true }, () => {
        this.disposedView?.dispose()
        this.disposedView = null
      })
    }
  }
}
