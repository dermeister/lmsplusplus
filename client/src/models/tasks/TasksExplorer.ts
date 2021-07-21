import { cached, Transaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer } from "../explorer/Explorer"
import { GroupNode } from "../explorer/GroupNode"
import { ItemNode } from "../explorer/ItemNode"

export class CourseNode extends GroupNode {
  @unobservable readonly item: Course

  @cached get taskNodes(): readonly ItemNode<Task>[] { return this.children as readonly ItemNode<Task>[] }

  constructor(title: string, course: Course, children: readonly ItemNode<Task>[]) {
    super(title, `course-${course.id}`, children)
    this.item = course
  }
}

export class TasksExplorer extends Explorer<Task> {
  private _courseToCreateTaskIn: Course | null = null
  private _taskToEdit: Task | null = null
  private _taskToDelete: Task | null = null

  @cached get courseNodes(): readonly CourseNode[] { return this.children as readonly CourseNode[] }
  @cached get selectedTask(): Task | null { return this.selectedNode?.item ?? null }
  @cached get courseToCreateTaskIn(): Course | null { return this._courseToCreateTaskIn }
  @cached get taskToEdit(): Task | null { return this._taskToEdit }
  @cached get taskToDelete(): Task | null { return this._taskToDelete }

  constructor(courses: readonly Course[]) { super(TasksExplorer.createCourseNodes(courses)) }

  @transaction
  updateCourses(courses: readonly Course[]): void {
    this.updateExplorer(TasksExplorer.createCourseNodes(courses))
    this._courseToCreateTaskIn = null
    this._taskToEdit = null
    this._taskToDelete = null
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

  private static createCourseNodes(courses: readonly Course[]): readonly CourseNode[] {
    const courseNodes = Transaction.run(() => {
      return courses.map(c => new CourseNode(c.name, c, TasksExplorer.createTaskNodes(c.tasks)))
    })
    return courseNodes
  }

  private static createTaskNodes(tasks: readonly Task[]): readonly ItemNode<Task>[] {
    const taskNodes = Transaction.run(() => {
      return tasks.map(t => new ItemNode(t.title, `task-${t.id}`, t))
    })
    return taskNodes
  }
}
