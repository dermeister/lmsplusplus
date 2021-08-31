import { Transaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer, GroupNode, ItemNode } from "../explorer"

export class CourseNode extends GroupNode {
  @unobservable readonly item: Course

  override get children(): readonly ItemNode<Task>[] { return super.children as readonly ItemNode<Task>[] }

  constructor(course: Course) {
    super(course.name, `course-${course.id}`, true, CourseNode.createTaskNodes(course.tasks))
    this.item = course
  }

  private static createTaskNodes(tasks: readonly Task[]): readonly ItemNode<Task>[] {
    function createItemNode(task: Task): ItemNode<Task> {
      return new ItemNode(task.title, `task-${task.id}`, true, task)
    }

    return Transaction.run(() => tasks.map(createItemNode))
  }
}

export class TasksExplorer extends Explorer<Task> {
  override get children(): readonly CourseNode[] { return super.children as readonly CourseNode[] }
  get selectedTask(): Task | null { return this.selectedNode?.item ?? null }

  constructor(courses: readonly Course[]) { super(TasksExplorer.createCourseNodes(courses)) }

  @transaction
  updateCourses(courses: readonly Course[]): void {
    this.updateExplorer(TasksExplorer.createCourseNodes(courses))
  }

  private static createCourseNodes(courses: readonly Course[]): readonly CourseNode[] {
    return Transaction.run(() => courses.map(c => new CourseNode(c)))
  }
}
