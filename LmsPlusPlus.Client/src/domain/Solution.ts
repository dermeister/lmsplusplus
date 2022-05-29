import { Task } from "./Task"

export class Solution {
    static readonly NO_ID = -1
    readonly id: number
    readonly task: Task
    readonly repositoryName: string | null
    readonly cloneUrl: string | null
    readonly websiteUrl: string | null

    constructor(id: number, task: Task, repositoryName: string | null, cloneUrl: string | null, websiteUrl: string | null) {
        this.id = id
        this.task = task
        this.repositoryName = repositoryName
        this.cloneUrl = cloneUrl
        this.websiteUrl = websiteUrl
    }
}
