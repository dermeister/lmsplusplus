import { Task } from "./Task"
import { Technology } from "./Technology"

export class Solution {
    static readonly NO_ID = -1
    readonly id: number
    readonly task: Task
    readonly name: string

    constructor(id: number, task: Task, name: string) {
        this.id = id
        this.task = task
        this.name = name
    }
}
