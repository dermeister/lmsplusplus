import { reaction, Ref, Rx, Transaction, unobservable } from "reactronic"
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

export class TasksExplorer extends Explorer<domain.Task> {
    @unobservable private readonly courses: Ref<readonly domain.Course[]> 
    
    override get children(): readonly CourseNode[] { return super.children as readonly CourseNode[] }
    get selectedTask(): domain.Task | null { return this.selectedNode?.item ?? null }

    constructor(courses: Ref<readonly domain.Course[]>) {
        super(TasksExplorer.createCourseNodes(courses.value))
        this.courses = courses
    }
    
    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this.courses)
            super.dispose()
        })
    }

    private static createCourseNodes(courses: readonly domain.Course[]): readonly CourseNode[] {
        return Transaction.run(() => courses.map(c => new CourseNode(c)))
    }
    
    @reaction
    private updateCourses(): void {
        let children = TasksExplorer.createCourseNodes(this.courses.observe())
        this.updateExplorer(children)
    }
}
