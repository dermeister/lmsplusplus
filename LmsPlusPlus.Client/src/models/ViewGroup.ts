import { transaction } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { View } from "./View"

export class ViewGroup extends ObservableObject {
  private _views: View[]
  private _activeView: View

  get views(): readonly View[] { return this._views }
  get activeView(): View { return this._activeView }

  constructor(views: View[], activeView: View) {
    super()
    this._views = views
    this._activeView = activeView
  }

  @transaction
  add(view: View): void {
    const views = this._views.toMutable()
    views.push(view)
    this._views = views
  }

  @transaction
  remove(view: View): void {
    if (this._activeView === view)
      throw new Error("Cannot remove active view")
    this._views = this._views.filter(p => p !== view)
  }

  @transaction
  setActive(view: View): void {
    this._activeView = view
  }

  @transaction
  replace(oldView: View, newView: View): void {
    if (this._activeView === oldView)
      this._activeView = newView
    const view = this._views.toMutable()
    this._views = view.map(view => view === oldView ? newView : view)
  }
}
