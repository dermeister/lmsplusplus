export enum MessageKind {
    Info,
    Error
}

export class Message {
    readonly kind: MessageKind
    readonly title: string
    readonly details: string

    constructor(king: MessageKind, title: string, details: string) {
        this.kind = king
        this.title = title
        this.details = details
    }
}
