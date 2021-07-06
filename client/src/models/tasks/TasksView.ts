import { monitor, Monitor, ObservableObject, reaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { SidePanel } from "../SidePanel"
import { TasksExplorer } from "../tasks/TasksExplorer"

export class TasksView extends ObservableObject {
  static readonly tasksMonitor = Monitor.create("Tasks monitor", 0, 0)
  @unobservable readonly leftPanel = new SidePanel("Tasks")
  @unobservable readonly explorer = new TasksExplorer([])

  @reaction
  @monitor(TasksView.tasksMonitor)
  private async init(): Promise<void> {
    const courses = await Promise.resolve([
      new Course("СПП", [new Task("Task 1"), new Task("Task 2")]),
      new Course("ЯП", [new Task("Task 1"), new Task("Task 2"), new Task("Task 3")]),
    ])

    this.explorer.updateCourses(courses)
  }
}
