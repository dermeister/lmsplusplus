import { Monitor, reaction, transaction, Transaction, unobservable } from "reactronic"
import { ReadOnlyDatabase } from "../../database"
import { Course } from "../../domain/Course"
import { Demo } from "../../domain/Demo"
import { Task } from "../../domain/Task"
import { ObservableObject } from "../../ObservableObject"
import { PanelGroup, Side } from "../PanelGroup"
import { DemoExplorer } from "./DemoExplorer"
import { TasksExplorer } from "./TasksExplorer"

export class TasksView extends ObservableObject {
  @unobservable readonly database: ReadOnlyDatabase
  @unobservable readonly tasksExplorer: TasksExplorer
  @unobservable readonly demoExplorer: DemoExplorer
  @unobservable readonly leftPanels: PanelGroup
  @unobservable readonly rightPanels: PanelGroup
  private runningDemos: Demo[] = []

  get monitor(): Monitor { return this.database.monitor }
  get createdTask(): Task | null {
    const task = this.tasksExplorer.editedTask
    if (task?.id !== Task.NO_ID)
      return null
    return task
  }
  get updatedTask(): Task | null {
    const task = this.tasksExplorer.editedTask
    if (!task || task.id === Task.NO_ID)
      return null
    return task
  }
  get deletedTask(): Task | null { return this.tasksExplorer.deletedTask }

  constructor(database: ReadOnlyDatabase) {
    super()
    this.database = database
    this.tasksExplorer = new TasksExplorer(database.courses)
    this.demoExplorer = new DemoExplorer(this.runningDemos)
    this.leftPanels = new PanelGroup(["tasks"], "tasks", Side.Left)
    this.rightPanels = new PanelGroup([], null, Side.Right)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.tasksExplorer.dispose()
      this.demoExplorer.dispose()
      this.leftPanels.dispose()
      this.rightPanels.dispose()
      super.dispose()
    })
  }

  @transaction
  createTask(course: Course): void {
    this.rightPanels.addPanel("editor")
    this.rightPanels.togglePanel("editor")
    this.tasksExplorer.createTask(course)
  }

  @transaction
  updateTask(task: Task): void {
    this.rightPanels.addPanel("editor")
    this.rightPanels.togglePanel("editor")
    this.tasksExplorer.updateTask(task)
  }

  @transaction
  deleteTask(task: Task): void {
    this.tasksExplorer.deleteTask(task)
  }

  @transaction
  runDemo(task: Task): void {
    const demos = this.database.getDemos(task)
    const runningDemos = this.runningDemos.toMutable()
    if (demos.length > 0) {
      const demo = demos[0]
      if (!runningDemos.includes(demo)) {
        runningDemos.push(demos[0])
        this.runningDemos = runningDemos
        this.rightPanels.addPanel("demo")
        this.rightPanels.togglePanel("demo")
        this.demoExplorer.updateDemos(this.runningDemos)
      }
    }
  }

  @reaction
  private explorer_synchronized_with_database(): void {
    this.tasksExplorer.updateCourses(this.database.courses)
  }

  @reaction
  private taskEditorPanel_removed_from_panel_group_when_taskEditor_disposed(): void {
    if (!this.tasksExplorer.taskEditor)
      this.rightPanels.removePanel("editor")
  }
}
