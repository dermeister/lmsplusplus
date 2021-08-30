import { Monitor, reaction, transaction, Transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { ObservableObject } from "../../ObservableObject"
import { Database } from "../../repositories"
import { Side, SidePanel, SidePanelGroup } from "../SidePanelGroup"
import { TasksExplorer } from "./TasksExplorer"

export class TasksView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Tasks")
  @unobservable readonly rightPanel = new SidePanel("Edit task")
  @unobservable readonly demoPanel = new SidePanel("Demo")
  @unobservable readonly solutionPanel = new SidePanel("Solution")
  @unobservable readonly explorer: TasksExplorer
  @unobservable readonly leftSidePanelGroup: SidePanelGroup
  @unobservable readonly rightSidePanelGroup: SidePanelGroup

  get monitor(): Monitor { return Database.monitor }
  get createdTask(): Task | null {
    const task = this.explorer.editedTask
    if (task?.id !== Task.NO_ID)
      return null
    return task
  }
  get updatedTask(): Task | null {
    const task = this.explorer.editedTask
    if (!task || task.id === Task.NO_ID)
      return null
    return task
  }
  get deletedTask(): Task | null { return this.explorer.deletedTask }

  constructor(courses: readonly Course[]) {
    super()
    this.explorer = new TasksExplorer(courses)
    this.leftSidePanelGroup = new SidePanelGroup([this.leftPanel], this.leftPanel, true, Side.Left)
    this.rightSidePanelGroup = new SidePanelGroup([], null, false, Side.Right)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.leftSidePanelGroup.dispose()
      this.rightSidePanelGroup.dispose()
      this.explorer.dispose()
    })
  }

  @transaction
  update(courses: readonly Course[]): void {
    this.explorer.updateCourses(courses)
  }

  @transaction
  createTask(course: Course): void {
    this.rightSidePanelGroup.addPanel(this.rightPanel)
    this.rightSidePanelGroup.togglePanel(this.rightPanel)
    this.explorer.createTask(course)
  }

  @transaction
  updateTask(task: Task): void {
    this.rightSidePanelGroup.addPanel(this.rightPanel)
    this.rightSidePanelGroup.togglePanel(this.rightPanel)
    this.explorer.updateTask(task)
  }

  @transaction
  deleteTask(task: Task): void {
    this.explorer.deleteTask(task)
  }

  @reaction
  private rightPanel_removed_from_panel_group_when_taskEditor_disposed(): void {
    if (!this.explorer.taskEditor)
      this.rightSidePanelGroup.removePanel(this.rightPanel)
  }
}
