import { cached, reaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer } from "../explorer/Explorer"
import { GroupNode } from "../explorer/GroupNode"
import { ItemNode } from "../explorer/ItemNode"

export class CourseNode extends GroupNode {
  private _tasks: ItemNode<Task>[] = []
  @unobservable readonly item: Course

  @cached get children(): ItemNode<Task>[] { return this._tasks }

  constructor(title: string, course: Course) {
    super(title)
    this.item = course
  }

  @reaction
  private updateTasks(): void { this._tasks = this.item.tasks.map(t => new ItemNode(t.title, t)) }
}

export class TasksExplorer extends Explorer<Task> {
  private _courseNodes: CourseNode[]
  private _taskToCreate: Task | null = null
  private _taskToEdit: Task | null = null
  private _taskToDelete: Task | null = null

  @cached get courseNodes(): readonly CourseNode[] { return this._courseNodes }
  @cached get selectedTask(): Task | null { return this.activeNode?.item ?? null }
  @cached get taskToCreate(): Task | null { return this._taskToCreate }
  @cached get taskToEdit(): Task | null { return this._taskToEdit }
  @cached get taskToDelete(): Task | null { return this._taskToDelete }

  constructor(courses: readonly Course[]) {
    super()
    this._courseNodes = this.createCourseNodes(courses)
  }

  @transaction
  private createCourseNodes(courses: readonly Course[]): CourseNode[] { return courses.map(c => new CourseNode(c.name, c)) }

  @transaction
  updateCourses(courses: readonly Course[]): void { this._courseNodes = this.createCourseNodes(courses) }

  @transaction
  createTask(course: Course): void { this._taskToCreate = new Task(null, course, "", "") }

  @transaction
  completeTaskCreation(): void { this._taskToCreate = null }

  @transaction
  editTask(task: Task): void { this._taskToEdit = task }

  @transaction
  completeTaskEditing(): void { this._taskToEdit = null }

  @transaction
  deleteTask(task: Task): void { this._taskToDelete = task }

  @transaction
  completeTaskDeletion(): void { this._taskToDelete = null }
}
