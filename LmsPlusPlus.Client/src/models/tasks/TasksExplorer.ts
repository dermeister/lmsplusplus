import { Transaction, transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Explorer, GroupNode, ItemNode } from "../explorer"

export class CourseNode extends GroupNode {
  @unobservable readonly item: domain.Course

  override get children(): readonly ItemNode<domain.Task>[] {
    return super.children as readonly ItemNode<domain.Task>[]
  }

  constructor(course: domain.Course) {
    super(course.name, `course-${course.id}`, CourseNode.createTaskNodes(course.tasks))
    this.item = course
  }

  private static createTaskNodes(tasks: readonly domain.Task[]): readonly ItemNode<domain.Task>[] {
    function createItemNode(task: domain.Task): ItemNode<domain.Task> {
      return new ItemNode(task.title, `task-${task.id}`, task)
    }

    return Transaction.run(() => tasks.map(createItemNode))
  }
}

export class TasksExplorer extends Explorer<domain.Task> {
  override get children(): readonly CourseNode[] { return super.children as readonly CourseNode[] }
  get selectedTask(): domain.Task | null { return this.selectedNode?.item ?? null }

  constructor(courses: readonly domain.Course[]) { super(TasksExplorer.createCourseNodes(courses)) }

  @transaction
  updateCourses(courses: readonly domain.Course[]): void {
    this.updateExplorer(TasksExplorer.createCourseNodes(courses))
  }

  private static createCourseNodes(courses: readonly domain.Course[]): readonly CourseNode[] {
    return Transaction.run(() => courses.map(c => new CourseNode(c)))
  }
}
