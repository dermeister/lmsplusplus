import { Transaction, transaction, isnonreactive } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { View } from "./View"

export abstract class ViewGroup extends ObservableObject {
    @isnonreactive readonly id: string
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

    override dispose(): void {
        Transaction.run(null, () => {
            const views = this._views.toMutable()
            while (views.length > 0) {
                const view = views.pop() as View
                view.dispose()
            }
            this._views = views
            super.dispose()
        })
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
