import { cached, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer } from "../explorer/Explorer"
import { GroupNode } from "../explorer/GroupNode"
import { ItemNode } from "../explorer/ItemNode"

export class CourseNode extends GroupNode {
  @unobservable readonly children: ItemNode<Task>[]

  constructor(title: string, children: ItemNode<Task>[] = []) {
    super(title)
    this.children = children
  }
}

export class TasksExplorer extends Explorer<Task> {
  private _courses: CourseNode[] = []

  constructor(courses: Course[]) {
    super()
    this._courses = this.courseNodes(courses)
  }

  @cached
  get courses(): CourseNode[] {
    return this._courses
  }

  @cached
  get task(): Task | null {
    return this.activeNode?.item ?? null
  }

  @transaction
  updateCourses(courses: Course[]): void {
    this._courses = this.courseNodes(courses)
  }

  @transaction
  private courseNodes(courses: Course[]): CourseNode[] {
    return courses.map(c => new CourseNode(c.name, this.taskNodes(c.tasks)))
  }

  @transaction
  private taskNodes(tasks: Task[]): ItemNode<Task>[] {
    return tasks.map(t => new ItemNode(t.title, t))
  }
}
