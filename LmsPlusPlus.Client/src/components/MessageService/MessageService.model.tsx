import React from "react"
import ReactDOM from "react-dom"
import { isnonreactive, reaction, transaction } from "reactronic"
import { AppError } from "../../AppError"
import { ObservableObject } from "../../ObservableObject"
import { Message, MessageKind } from "./Message"
import * as view from "./MessageService.view"

export interface IMessageService {
    showError(error: AppError): void
}

export class MessageService extends ObservableObject implements IMessageService {
    @isnonreactive private static readonly _container = document.getElementById("error") as HTMLDivElement
    private _errors: Error[] = []
    private _messages: Message[] = []

    get errors(): Error[] { return this._errors }
    get messages(): readonly Message[] { return this._messages }

    override dispose(): void {
        ReactDOM.unmountComponentAtNode(MessageService._container)
        super.dispose()
    }

    @transaction
    showError(error: AppError): void {
        const messages = this._messages.toMutable()
        messages.push(new Message(MessageKind.Error, error.title, error.details))
        this._messages = messages
    }

    @transaction
    closeError(error: Error): void {
        const errors = this._errors.toMutable()
        this._errors = errors.filter(e => e !== error)
    }

    @transaction
    closeMessage(message: Message): void {
        this._messages = this._messages.filter(m => m !== message)
    }

    @reaction
    private renderMessages(): void {
        ReactDOM.render(<view.Messages messageService={this} />, MessageService._container)
    }
}
