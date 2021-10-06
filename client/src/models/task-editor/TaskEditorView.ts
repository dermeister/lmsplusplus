import * as monaco from "monaco-editor"
import { Monitor, transaction, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { SidePanel } from "../SidePanel"
import { View } from "../View"

export class TaskEditorView extends View {
  @unobservable readonly monitor: Monitor
  @unobservable readonly sidePanel = new SidePanel("Task Editor")
  @unobservable private readonly id: number
  @unobservable private readonly _course: domain.Course
  private _taskTitle: string
  @unobservable private readonly _taskDescription: monaco.editor.ITextModel
  private _createdTask: domain.Task | null = null
  private _updatedTask: domain.Task | null = null
  private _isViewClosed = false

  get taskTitle(): string { return this._taskTitle }
  get taskDescription(): monaco.editor.ITextModel { return this._taskDescription }
  get isViewClosed(): boolean { return this._isViewClosed }
  get createdTask(): domain.Task | null { return this._createdTask }
  get updatedTask(): domain.Task | null { return this._updatedTask }

  constructor(task: domain.Task, monitor: Monitor, key: string) {
    super("Editor", key)
    this.id = task.id
    this._taskTitle = task.title
    this._course = task.course
    this._taskDescription = monaco.editor.createModel(task.description, "markdown")
    this.monitor = monitor
  }

  @transaction
  setTaskTitle(title: string): void {
    this._taskTitle = title
  }

  @transaction
  save(): void {
    const task = new domain.Task(this.id, this._course, this._taskTitle, this._taskDescription.getValue())
    if (task.id === domain.Task.NO_ID)
      this._createdTask = task
    else
      this._updatedTask = task
  }

  @transaction
  cancel(): void {
    this._isViewClosed = true
  }

  override dispose(): void {
    Transaction.run(() => {
      this.sidePanel.dispose()
      this._taskDescription.dispose()
      super.dispose()
    })
  }
}
