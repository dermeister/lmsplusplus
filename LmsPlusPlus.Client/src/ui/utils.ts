import { AppError } from "../AppError"
import { IMessageService } from "./MessageService"

export function combineClassNames(...classNames: (string | undefined)[]): string {
    return classNames.filter(c => c !== undefined).join(" ")
}

export function maybeValue<T>(value: T, condition: boolean): T | undefined {
    if (condition)
        return value
}

export function handleError(e: unknown, messageService: IMessageService): void {
    if (!(e instanceof AppError)) {
        const message = e instanceof Error ? e.message : `${e}`
        e = new AppError("Something went wrong", message)
    }
    messageService.showError(e as AppError)
}
