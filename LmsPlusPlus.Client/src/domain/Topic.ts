import { Task } from "./Task"

export class Topic {
    static readonly NO_ID = -1
    readonly id: number
    readonly name: string
    private _tasks: Task[] = []

    get tasks(): Task[] { return this._tasks }
    set tasks(tasks: Task[]) { this._tasks = tasks }

    constructor(id: number, name: string) {
        this.id = id
        this.name = name
    }
}
