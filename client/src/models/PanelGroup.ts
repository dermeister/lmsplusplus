import { transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export enum Side {
  Left,
  Right
}

export class PanelGroup extends ObservableObject {
  @unobservable readonly side: Side
  private _panels: string[]
  private _activePanel: string | null

  get panels(): readonly string[] { return this._panels }
  get activePanel(): string | null { return this._activePanel }
  get isOpened(): boolean { return this._activePanel !== null }

  constructor(panels: string[], activePanel: string | null, side: Side) {
    super()
    this._panels = panels
    this._activePanel = activePanel
    this.side = side
  }

  @transaction
  addPanel(panel: string): void {
    const panels = this._panels.toMutable()
    panels.push(panel)
    this._panels = panels
  }

  @transaction
  removePanel(panel: string): void {
    const panels = this._panels.toMutable()
    this._panels = panels.filter(p => p !== panel)
    if (this._activePanel === panel)
      this._activePanel = null
  }

  @transaction
  togglePanel(panel: string): void {
    this._activePanel = panel !== this._activePanel ? panel : null
  }
}
