import { User } from "./User"

export class Group {
    readonly id: number
    readonly name: string
    readonly users: readonly User[]
    readonly topicId: number

    constructor(id: number, name: string, users: readonly User[], topicId: number) {
        this.id = id
        this.name = name
        this.users = users
        this.topicId = topicId
    }
}
