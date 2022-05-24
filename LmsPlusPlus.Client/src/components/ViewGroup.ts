import { transaction, unobservable } from "reactronic"
import { View } from "./View"
import { ObservableObject } from "../ObservableObject"

export abstract class ViewGroup extends ObservableObject {
    @unobservable readonly id: string
    private _currentView: View | null = null
    private _views: View[] = []

    get currentView(): View {
        if (this._currentView === null)
            throw new Error("No view is opened.")
        return this._currentView
    }
    abstract get iconUrl(): string

    constructor(id: string) {
        super()
        this.id = id
    }

    @transaction
    openView(view: View): void {
        const views = this._views.toMutable()
        views.push(view)
        this._currentView = view
        this._views = views
    }

    @transaction
    returnToPreviousView(): View {
        if (this._views.length <= 1)
            throw new Error("Cannot close view.")
        const views = this._views.toMutable()
        const closedView = views.pop() as View
        this._currentView = views[views.length - 1]
        this._views = views
        setTimeout(() => closedView.dispose(), 0)
        return closedView
    }
}
