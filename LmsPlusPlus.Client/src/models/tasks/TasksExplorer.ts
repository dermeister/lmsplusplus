import { Ref, Transaction, unobservable } from "reactronic"
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
        super()
        this.courses = courses
    }
    
    protected createChildren(): CourseNode[] {
        return this.courses.observe().map(c => new CourseNode(c))
    }
}
