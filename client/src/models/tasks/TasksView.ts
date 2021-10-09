import { Monitor, reaction, standalone, throttling, transaction, Transaction, unobservable } from "reactronic"
import { ReadOnlyDatabase } from "../../database"
import { Disposer } from "../../Disposer"
import * as domain from "../../domain"
import { DemoView } from "../demo"
import { SidePanel } from "../SidePanel"
import { TaskEditorView } from "../task-editor"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { TasksExplorer } from "./TasksExplorer"
import MarkdownIt from "markdown-it"

export class TasksView extends View {
  @unobservable readonly viewGroup = new ViewGroup([this], this)
  @unobservable readonly explorer: TasksExplorer
  @unobservable readonly sidePanel = new SidePanel("Tasks")
  private static readonly markdown = new MarkdownIt()
  @unobservable private readonly disposer = new Disposer()
  @unobservable private readonly database: ReadOnlyDatabase
  private _taskEditorView: TaskEditorView | null = null
  private _createdTask: domain.Task | null = null
  private _updatedTask: domain.Task | null = null
  private _deletedTask: domain.Task | null = null
  private _demoView: DemoView | null = null
  private _descriptionHtml: string | null = null

  get taskEditorView(): TaskEditorView | null { return this._taskEditorView }
  get monitor(): Monitor { return this.database.monitor }
  get createdTask(): domain.Task | null { return this._createdTask }
  get updatedTask(): domain.Task | null { return this._updatedTask }
  get deletedTask(): domain.Task | null { return this._deletedTask }
  get demoView(): DemoView | null { return this._demoView }
  get descriptionHtml(): string | null { return this._descriptionHtml }

  constructor(database: ReadOnlyDatabase, key: string) {
    super("Tasks", key)
    this.database = database
    this.explorer = new TasksExplorer(this.database.courses)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.viewGroup.dispose()
      this.explorer.dispose()
      this.sidePanel.dispose()
      this.disposer.dispose()
      this._taskEditorView?.dispose()
      this._demoView?.dispose()
      super.dispose()
    })
  }

  @transaction
  openDemos(task: domain.Task): void {
    this.createDemoView(task)
  }

  hasDemos(task: domain.Task): boolean {
    const demos = task.solutions.map(s => s.demo)
    return demos.length > 0
  }

  @transaction
  createTask(course: domain.Course): void {
    this.ensureNoTaskEdited()
    const task = new domain.Task(domain.Task.NO_ID, course, "", "")
    this.createTaskEditorView(task)
  }

  @transaction
  updateTask(task: domain.Task): void {
    this.ensureNoTaskEdited()
    this.createTaskEditorView(task)
  }

  @transaction
  deleteTask(task: domain.Task): void {
    this.ensureNoTaskEdited()
    this._deletedTask = task
  }

  @transaction
  createSolution(task: domain.Task): void {

  }

  @transaction
  deleteSolution(task: domain.Task): void {

  }

  private ensureNoTaskEdited(): void {
    if (this._taskEditorView)
      throw new Error("Task already being edited")
  }

  @transaction
  private createDemoView(task: domain.Task): void {
    if (this.hasDemos(task)) {
      this._demoView = new DemoView(task.solutions.map(s => s.demo), "Demo")
      this.viewGroup.replace(this, this._demoView)
    }
  }

  @transaction
  private createTaskEditorView(task: domain.Task): void {
    this._taskEditorView = new TaskEditorView(task, this.monitor, "Editor")
    this.viewGroup.replace(this, this._taskEditorView)
  }

  @reaction
  private explorer_synchronized_with_database(): void {
    this.explorer.updateCourses(this.database.courses)
  }

  @reaction
  private taskEditorView_edited_task_propagated(): void {
    this._createdTask = this._taskEditorView?.createdTask ?? null
    this._updatedTask = this._taskEditorView?.updatedTask ?? null
  }

  @reaction @throttling(0)
  private taskEditorView_destroyed_when_edited_task_propagated_and_monitor_is_not_active(): void {
    const createdTask = this._taskEditorView?.createdTask
    const updatedTask = this._taskEditorView?.updatedTask
    if ((createdTask || updatedTask) && !this.monitor.isActive)
      standalone(() => this.destroyTaskEditorView())
  }

  @reaction
  private taskEditorView_destroyed_on_viewClosed(): void {
    if (this._taskEditorView?.isViewClosed)
      standalone(() => this.destroyTaskEditorView())
  }

  @transaction
  private destroyTaskEditorView(): void {
    if (!this._taskEditorView)
      throw new Error("_taskEditorView is null")
    this.viewGroup.replace(this._taskEditorView, this)
    this.disposer.enqueue(this._taskEditorView)
    this._taskEditorView = null
  }

  @reaction
  private demoView_destroyed_on_viewClosed(): void {
    if (this._demoView?.isViewClosed)
      standalone(() => this.destroyDemoView())
  }

  @transaction
  private destroyDemoView(): void {
    if (!this._demoView)
      throw new Error("_demoView is null")
    this.viewGroup.replace(this._demoView, this)
    this.disposer.enqueue(this._demoView)
    this._demoView = null
  }

  @reaction
  private descriptionHtml_synchronized_with_selectedTask_description(): void {
    const description = this.explorer.selectedTask?.description
    if (description)
      this._descriptionHtml = TasksView.markdown.render(description)
    else
      this._descriptionHtml = null
  }
}
