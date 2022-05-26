import { ObservableObject } from "../ObservableObject"

export abstract class OptionCategory extends ObservableObject {
    get isPerformingOperation(): boolean { return false }

    abstract render(): JSX.Element
}
