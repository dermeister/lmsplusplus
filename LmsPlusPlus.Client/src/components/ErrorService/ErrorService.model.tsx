import React from "react"
import ReactDOM from "react-dom"
import { reaction, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../../ObservableObject"
import * as view from "./ErrorService.view"

export interface IErrorService {
    showError(error: Error): void
}

export class ErrorService extends ObservableObject implements IErrorService {
    @unobservable private static readonly _container = document.getElementById("error") as HTMLDivElement
    private _errors: Error[] = []

    get errors(): Error[] { return this._errors }

    override dispose(): void {
        ReactDOM.unmountComponentAtNode(ErrorService._container)
        super.dispose()
    }

    @transaction
    showError(error: Error): void {
        const errors = this._errors.toMutable()
        errors.push(error)
        this._errors = errors
    }

    @transaction
    closeError(error: Error): void {
        const errors = this._errors.toMutable()
        this._errors = errors.filter(e => e !== error)
    }

    @reaction
    private renderErrors(): void {
        ReactDOM.render(<view.ErrorService errorService={this} />, ErrorService._container)
    }
}
