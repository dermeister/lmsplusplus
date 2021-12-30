import { Monitor, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export abstract class View extends ObservableObject {
    @unobservable readonly id: string

    abstract get sidePanelTitle(): string
    abstract get monitor(): Monitor | null

    protected constructor(id: string) {
        super()
        this.id = id
    }
}
