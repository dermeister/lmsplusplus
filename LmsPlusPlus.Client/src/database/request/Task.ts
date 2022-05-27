export interface CreateTask {
    title: string
    description: string
    topicId: number,
    technologyIds: readonly number[]
}

export interface UpdateTask {
    title: string
    description: string
    technologyIds: readonly number[]
}
