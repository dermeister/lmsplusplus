import { cached, reaction, Transaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer } from "../explorer/Explorer"
import { GroupNode } from "../explorer/GroupNode"
import { ItemNode } from "../explorer/ItemNode"

export class CourseNode extends GroupNode {
  @unobservable readonly item: Course
  protected override _children: readonly ItemNode<Task>[] = []

  @cached override get children(): readonly ItemNode<Task>[] { return this._children }

  constructor(title: string, course: Course) {
    super(title)
    this.item = course
  }

  override dispose(): void {
    Transaction.run(() => {
      this.children.forEach(c => c.dispose())
      super.dispose()
    })
  }

  @reaction
  private init_children(): void {
    this._children = this.item.tasks.map(t => new ItemNode(t.title, t))
  }
}

export class TasksExplorer extends Explorer<Task> {
  private _courseNodes: CourseNode[]
  private _courseToCreateTaskIn: Course | null = null
  private _taskToEdit: Task | null = null
  private _taskToDelete: Task | null = null

  @cached get courseNodes(): readonly CourseNode[] { return this._courseNodes }
  @cached get selectedTask(): Task | null { return this.activeNode?.item ?? null }
  @cached get courseToCreateTaskIn(): Course | null { return this._courseToCreateTaskIn }
  @cached get taskToEdit(): Task | null { return this._taskToEdit }
  @cached get taskToDelete(): Task | null { return this._taskToDelete }

  constructor(courses: readonly Course[]) {
    super()
    this._courseNodes = this.createCourseNodes(courses)
  }

  @transaction
  updateCourses(courses: readonly Course[]): void {
    this._courseToCreateTaskIn = null
    this._taskToEdit = null
    this._taskToDelete = null
    this._courseNodes.forEach(c => c.dispose())
    this._courseNodes = this.createCourseNodes(courses)
  }

  @transaction
  setCourseToCreateTaskIn(course: Course | null): void {
    this._taskToEdit = null
    this._taskToDelete = null
    this._courseToCreateTaskIn = course
  }

  @transaction
  setTaskToEdit(task: Task | null): void {
    this._courseToCreateTaskIn = null
    this._taskToDelete = null
    this._taskToEdit = task
  }

  @transaction
  setTaskToDelete(task: Task | null): void {
    this._courseToCreateTaskIn = null
    this._taskToEdit = null
    this._taskToDelete = task
  }

  @transaction
  private createCourseNodes(courses: readonly Course[]): CourseNode[] {
    return courses.map(c => new CourseNode(c.name, c))
  }
}
