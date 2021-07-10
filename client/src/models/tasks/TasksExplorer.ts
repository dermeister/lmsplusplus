import { cached, reaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer } from "../explorer/Explorer"
import { GroupNode } from "../explorer/GroupNode"
import { ItemNode } from "../explorer/ItemNode"

export class CourseNode extends GroupNode {
  private _tasks: ItemNode<Task>[] = []
  @unobservable private readonly course: Course

  constructor(title: string, course: Course) {
    super(title)
    this.course = course
  }

  @cached
  get children(): ItemNode<Task>[] {
    return this._tasks
  }

  @reaction
  private updateTasks(): void {
    this._tasks = this.course.tasks.map(t => new ItemNode(t.title, t))
  }
}

export class TasksExplorer extends Explorer<Task> {
  private _courseNodes: CourseNode[]
  private _taskToDelete: Task | null = null

  constructor(courses: readonly Course[]) {
    super()
    this._courseNodes = this.createCourseNodes(courses)
  }

  @cached
  get courseNodes(): readonly CourseNode[] {
    return this._courseNodes
  }

  @cached
  get selectedTask(): Task | null {
    return this.activeNode?.item ?? null
  }

  @cached
  get taskToDelete(): Task | null {
    return this._taskToDelete
  }

  @transaction
  private createCourseNodes(courses: readonly Course[]): CourseNode[] {
    return courses.map(c => new CourseNode(c.name, c))
  }

  @transaction
  updateCourses(courses: readonly Course[]): void {
    this._courseNodes = this.createCourseNodes(courses)
  }

  @transaction
  setTaskToDelete(task: Task | null): void {
    this._taskToDelete = task
  }
}
