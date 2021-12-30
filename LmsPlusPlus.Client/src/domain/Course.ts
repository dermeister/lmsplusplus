import { Task } from "./Task"

export class Course {
    static readonly NO_ID = -1
    readonly id: number
    readonly name: string
    private _tasks: readonly Task[] = []
    private tasksInitialized = false

    get tasks(): readonly Task[] {
        if (!this.tasksInitialized)
            throw new Error("Course tasks have not been initialized")
        return this._tasks
    }
    set tasks(tasks: readonly Task[]) {
        if (!this.tasksInitialized) {
            this._tasks = tasks
            this.tasksInitialized = true
        } else
            throw new Error("Course tasks have already been initialized")
    }

    constructor(id: number, name: string) {
        this.id = id
        this.name = name
    }
}
