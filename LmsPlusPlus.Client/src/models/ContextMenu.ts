import { transaction } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class ContextMenu extends ObservableObject {
    private _x = 0
    private _y = 0
    private _isOpened = false

    get x(): number { return this._x }
    get y(): number { return this._y }
    get isOpened(): boolean { return this._isOpened }

    @transaction
    open(x: number, y: number): void {
        this._x = x
        this._y = y
        this._isOpened = true
    }

    @transaction
    close(): void {
        this._x = 0
        this._y = 0
        this._isOpened = false
    }
}
