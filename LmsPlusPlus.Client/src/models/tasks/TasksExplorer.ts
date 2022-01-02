import { reaction, Ref, Transaction, unobservable } from "reactronic"
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
        return Transaction.run(() => tasks.map(task => new ItemNode(task.title, `task-${task.id}`, task)))
    }
}

export class TasksExplorer extends Explorer<domain.Task, CourseNode> {
    @unobservable private readonly courses: Ref<readonly domain.Course[]>

    constructor(courses: Ref<readonly domain.Course[]>) {
        super(TasksExplorer.createChildren(courses.value))
        this.courses = courses
    }

    private static createChildren(courses: readonly domain.Course[]): CourseNode[] {
        return courses.map(c => new CourseNode(c))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = TasksExplorer.createChildren(this.courses.observe())
        this.updateChildren(newChildren)
    }
}
