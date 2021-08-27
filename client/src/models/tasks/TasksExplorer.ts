import { reaction, throttling, Transaction, transaction, unobservable } from "reactronic"
import { Course } from "../../domain/Course"
import { Task } from "../../domain/Task"
import { Explorer, GroupNode, ItemNode } from "../explorer"
import { TaskEditor } from "./TaskEditor"

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
  private _deletedTask: Task | null = null
  private _taskEditor: TaskEditor | null = null
  private _editedTask: Task | null = null
  private taskEditorToBeDisposed: TaskEditor | null = null

  override get children(): readonly CourseNode[] { return super.children as readonly CourseNode[] }
  get selectedTask(): Task | null { return this.selectedNode?.item ?? null }
  get taskEditor(): TaskEditor | null { return this._taskEditor }
  get editedTask(): Task | null { return this._editedTask }
  get deletedTask(): Task | null { return this._deletedTask }

  constructor(courses: readonly Course[]) { super(TasksExplorer.createCourseNodes(courses)) }

  @transaction
  updateCourses(courses: readonly Course[]): void {
    this.updateExplorer(TasksExplorer.createCourseNodes(courses))
  }

  @transaction
  createTask(course: Course): void {
    if (this._taskEditor != null)
      throw new Error("Task already being edited")
    const task = new Task(Task.NO_ID, course, "", "")
    this._taskEditor = new TaskEditor(task)
  }

  @transaction
  updateTask(task: Task): void {
    if (this._taskEditor != null)
      throw new Error("Task already being edited")
    this._taskEditor = new TaskEditor(task)
  }

  @transaction
  deleteTask(task: Task): void {
    this._deletedTask = task
    // Here _deletedTask must be reset to null,
    // but can only be done when reactions are run in same transaction
  }

  private static createCourseNodes(courses: readonly Course[]): readonly CourseNode[] {
    return Transaction.run(() => courses.map(c => new CourseNode(c)))
  }

  @reaction
  private taskEditor_editResult_propagated(): void {
    const editResult = this._taskEditor?.editResult
    switch (editResult?.status) {
      case "saved":
        this._editedTask = editResult.task
        this.markCurrentTaskEditorToBeDisposed()
        // Here _editedTask must be reset to null,
        // but can only be done when reactions are run in same transaction
        break
      case "canceled":
        this.markCurrentTaskEditorToBeDisposed()
        break
    }
  }

  private markCurrentTaskEditorToBeDisposed(): void {
    Transaction.runAs({ standalone: true }, () => {
      this.taskEditorToBeDisposed = this._taskEditor
      this._taskEditor = null
    })
  }

  @reaction @throttling(0)
  private taskEditorToBeDisposed_disposed(): void {
    if (this.taskEditorToBeDisposed)
      Transaction.runAs({ standalone: true }, () => {
        this.taskEditorToBeDisposed?.dispose()
        this.taskEditorToBeDisposed = null
      })
  }
}
