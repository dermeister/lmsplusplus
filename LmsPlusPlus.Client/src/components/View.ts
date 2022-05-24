import { ObservableObject } from "../ObservableObject"

export abstract class View extends ObservableObject {
    abstract get title(): string
    get isPulsing(): boolean { return false }

    abstract renderSidePanelContent(): JSX.Element

    abstract renderMainPanelContent(): JSX.Element
}
