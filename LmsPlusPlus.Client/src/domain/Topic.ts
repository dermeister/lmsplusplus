import { Group } from "./Group"
import { Task } from "./Task"

export class Topic {
    static readonly NO_ID = -1
    readonly id: number
    readonly name: string
    readonly groups: Group[] = []
    tasks: Task[] = []

    constructor(id: number, name: string, groups: Group[]) {
        this.id = id
        this.name = name
        this.groups = groups
    }
}
