import { cached, reaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer } from "../explorer/Explorer"
import { GroupNode } from "../explorer/GroupNode"
import { ItemNode } from "../explorer/ItemNode"

export class CourseNode extends GroupNode {
  protected _children: ItemNode<Task>[] = []
  @unobservable readonly item: Course

  @cached get children(): ItemNode<Task>[] { return this._children }

  constructor(title: string, course: Course) {
    super(title)
    this.item = course
  }

  dispose(): void {
    this.children.forEach(c => c.dispose())
    super.dispose()
  }

  @reaction
  private updateTasks(): void { this._children = this.item.tasks.map(t => new ItemNode(t.title, t)) }
}

export class TasksExplorer extends Explorer<Task> {
  private _courseNodes: CourseNode[]
  private _courseToCreateTaskAt: Course | null = null
  private _taskToEdit: Task | null = null
  private _taskToDelete: Task | null = null

  @cached get courseNodes(): readonly CourseNode[] { return this._courseNodes }
  @cached get selectedTask(): Task | null { return this.activeNode?.item ?? null }
  @cached get courseToCreateTaskAt(): Course | null { return this._courseToCreateTaskAt }
  @cached get taskToEdit(): Task | null { return this._taskToEdit }
  @cached get taskToDelete(): Task | null { return this._taskToDelete }

  constructor(courses: readonly Course[]) {
    super()
    this._courseNodes = this.createCourseNodes(courses)
  }

  @transaction
  updateCourses(courses: readonly Course[]): void {
    this._courseNodes.forEach(c => c.dispose())
    this._courseNodes = this.createCourseNodes(courses)
  }

  @transaction
  setCoursesToCreateTaskAt(course: Course | null): void { this._courseToCreateTaskAt = course }

  @transaction
  setTaskToEdit(task: Task | null): void { this._taskToEdit = task }

  @transaction
  setTaskToDelete(task: Task | null): void { this._taskToDelete = task }

  @transaction
  private createCourseNodes(courses: readonly Course[]): CourseNode[] { return courses.map(c => new CourseNode(c.name, c)) }
}
