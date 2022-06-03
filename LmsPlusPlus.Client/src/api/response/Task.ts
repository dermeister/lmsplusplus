export interface Task {
    id: number
    title: string
    description: string
    topicId: number
    technologyIds: readonly number[]
}
