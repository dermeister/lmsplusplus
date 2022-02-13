import { Task } from "./Task"
import { Technology } from "./Technology"

export class Solution {
    static readonly NO_ID = -1
    readonly id: number
    readonly task: Task
    readonly name: string
    readonly technology: Technology | null

    constructor(id: number, task: Task, name: string, technology: Technology | null) {
        this.id = id
        this.task = task
        this.name = name
        this.technology = technology
    }
}
