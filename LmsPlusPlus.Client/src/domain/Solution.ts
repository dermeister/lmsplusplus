import { Task } from "./Task"
import { User } from "./User"

export class Solution {
    static readonly NO_ID = -1
    readonly id: number
    readonly task: Task
    readonly repositoryName: string | null
    readonly cloneUrl: string | null
    readonly websiteUrl: string | null
    readonly solver: User | null = null

    constructor(id: number, task: Task, repositoryName: string | null, cloneUrl: string | null, websiteUrl: string | null, solver: User | null) {
        this.id = id
        this.task = task
        this.repositoryName = repositoryName
        this.cloneUrl = cloneUrl
        this.websiteUrl = websiteUrl
        this.solver = solver
    }
}
