import { ObservableObject, unobservable } from "reactronic"

export abstract class View extends ObservableObject {
    @unobservable readonly id: string

    abstract get title(): string
    get isPulsing(): boolean { return false }

    constructor(id: string) {
        super()
        this.id = id
    }

    abstract renderSidePanelContent(): JSX.Element

    abstract renderMainPanelContent(): JSX.Element
}
