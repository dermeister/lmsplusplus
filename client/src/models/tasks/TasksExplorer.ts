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
  @unobservable readonly courses: CourseNode[] = []

  constructor(courses: Course[]) {
    super()
    this.courses = this.courseNodes(courses)
  }

  @cached
  get task(): Task | null {
    return this.activeNode?.item ?? null
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
