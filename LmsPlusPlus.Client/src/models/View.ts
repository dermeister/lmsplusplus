import { unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export abstract class View extends ObservableObject {
    @unobservable readonly id: string

    abstract get sidePanelTitle(): string
    get isPerformingOperation(): boolean { return false }

    protected constructor(id: string) {
        super()
        this.id = id
    }
}
