export class AppError extends Error {
    readonly title: string
    readonly details: string

    constructor(title: string, details: string) {
        super(`${title}: ${details}`)
        this.title = title
        this.details = details
    }
}
