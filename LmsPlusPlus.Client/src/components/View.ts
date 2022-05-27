import { ObservableObject } from "../ObservableObject"

export abstract class View extends ObservableObject {
    abstract get title(): string
    get shouldShowLoader(): boolean { return false }

    abstract renderSidePanelContent(): JSX.Element

    abstract renderMainPanelContent(): JSX.Element
}
