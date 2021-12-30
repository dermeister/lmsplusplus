import { transaction } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class DemoService extends ObservableObject {
    private _isRunning = false

    get isRunning(): boolean { return this._isRunning }

    @transaction
    start(): void {
        this._isRunning = true
    }

    @transaction
    stop(): void {
        this._isRunning = false
    }

    @transaction
    show(): void {}

    @transaction
    hide(): void {}
}
