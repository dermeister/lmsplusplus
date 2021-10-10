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
import { SolutionEditorView } from "../solution-editor"

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
  private _solutionEditorView: SolutionEditorView | null = null
  private _createdSolution: domain.Solution | null = null
  private _deletedSolution: domain.Solution | null = null

  get taskEditorView(): TaskEditorView | null { return this._taskEditorView }
  get monitor(): Monitor { return this.database.monitor }
  get createdTask(): domain.Task | null { return this._createdTask }
  get updatedTask(): domain.Task | null { return this._updatedTask }
  get deletedTask(): domain.Task | null { return this._deletedTask }
  get demoView(): DemoView | null { return this._demoView }
  get descriptionHtml(): string | null { return this._descriptionHtml }
  get solutionEditorView(): SolutionEditorView | null { return this._solutionEditorView }
  get createdSolution(): domain.Solution | null { return this._createdSolution }
  get deletedSolution(): domain.Solution | null { return this._deletedSolution }

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
      this._solutionEditorView?.dispose()
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
    this.ensureNoTaskEdited()
    const solution = new domain.Solution(domain.Solution.NO_ID, task, "")
    solution.demo = new domain.Demo(domain.Demo.NO_ID, solution)
    solution.demo.services = []
    this._solutionEditorView = new SolutionEditorView(solution, this.monitor, "Solution editor")
    this.viewGroup.replace(this, this._solutionEditorView)
  }

  @transaction
  deleteSolution(solution: domain.Solution): void {
    this.ensureNoSolutionEdited()
    this._deletedSolution = solution
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
    this._taskEditorView = new TaskEditorView(task, this.monitor, "Task editor")
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

  @transaction
  private ensureNoSolutionEdited(): void {
    if (this._solutionEditorView)
      throw new Error("Solution already being edited")
  }

  @reaction
  private solutionEditorView_edited_solution_propagated(): void {
    this._createdSolution = this._solutionEditorView?.createdSolution ?? null
  }

  @reaction @throttling(0)
  private solutionEditorView_destroyed_when_edited_solution_propagated_and_monitor_is_not_active(): void {
    const createdSolution = this._solutionEditorView?.createdSolution
    const updatedSolution = this._solutionEditorView?.updatedSolution
    if ((createdSolution || updatedSolution) && !this.monitor.isActive)
      standalone(() => this.destroySolutionEditorView())
  }

  @reaction
  private solutionEditorView_destroyed_on_viewClosed(): void {
    if (this._solutionEditorView?.isViewClosed)
      standalone(() => this.destroySolutionEditorView())
  }

  @transaction
  private destroySolutionEditorView(): void {
    if (!this._solutionEditorView)
      throw new Error("_solutionEditorView is null")
    this.viewGroup.replace(this._solutionEditorView, this)
    this.disposer.enqueue(this._solutionEditorView)
    this._solutionEditorView = null
  }
}
