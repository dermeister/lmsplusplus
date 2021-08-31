import { reaction, transaction, Transaction, unobservable } from "reactronic"
import { ReadOnlyDatabase } from "../../database"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { TasksExplorer } from "./TasksExplorer"

export class TasksView extends View {
  @unobservable readonly database: ReadOnlyDatabase
  @unobservable readonly tasksExplorer: TasksExplorer
  @unobservable readonly sidePanel = new SidePanel("Tasks")
  private _editedTask: Task | null = null
  private _deletedTask: Task | null = null

  get editedTask(): Task | null { return this._editedTask }
  get deletedTask(): Task | null { return this._deletedTask }

  constructor(database: ReadOnlyDatabase) {
    super("Tasks")
    this.database = database
    this.tasksExplorer = new TasksExplorer(this.database.courses)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.tasksExplorer.dispose()
      this.sidePanel.dispose()
      super.dispose()
    })
  }

  @transaction
  createTask(course: Course | null): void {
    this._editedTask = course ? new Task(Task.NO_ID, course, "", "") : null
  }

  @transaction
  updateTask(task: Task | null): void {
    this._editedTask = task
  }

  @transaction
  setDeletedTask(task: Task | null): void {
    this._deletedTask = task
  }

  @reaction
  private explorer_synchronized_with_database(): void {
    this.tasksExplorer.updateCourses(this.database.courses)
  }
}
