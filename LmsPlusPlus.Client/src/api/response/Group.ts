export interface Group {
    readonly id: number
    readonly name: string
    readonly userIds: readonly number[]
    readonly topicId: number
}
