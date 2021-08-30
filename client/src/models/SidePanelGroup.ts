import { transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class SidePanel {
  readonly title: string

  constructor(title: string) {
    this.title = title
  }
}

export enum Side {
  Left,
  Right
}

export class SidePanelGroup extends ObservableObject {
  @unobservable readonly side: Side
  private _panels: SidePanel[]
  private _activePanel: SidePanel | null
  private _isOpened: boolean

  get panels(): readonly SidePanel[] { return this._panels }
  get activePanel(): SidePanel | null { return this._activePanel }
  get isOpened(): boolean { return this._isOpened }

  constructor(panels: SidePanel[], activePanel: SidePanel | null, isOpened: boolean, side: Side) {
    super()
    this._panels = panels
    this._activePanel = activePanel
    this._isOpened = isOpened
    this.side = side
  }

  @transaction
  addPanel(panel: SidePanel): void {
    const panels = this._panels.toMutable()
    panels.push(panel)
    this._panels = panels
  }

  @transaction
  removePanel(panel: SidePanel): void {
    const panels = this._panels.toMutable()
    this._panels = panels.filter(p => p !== panel)
  }

  @transaction
  togglePanel(panel: SidePanel): void {
    if (panel !== this._activePanel) {
      this._activePanel = panel
      this._isOpened = true
    } else {
      this._isOpened = !this._isOpened
    }
  }
}
