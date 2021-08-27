import { transaction, Transaction, unobservable } from "reactronic"
import { Demo } from "../../domain/Demo"
import { ObservableObject } from "../../ObservableObject"
import { SidePanel } from "../SidePanel"
import { DemoExplorer } from "./DemoExplorer"

export class DemoView extends ObservableObject {
  @unobservable readonly leftPanel = new SidePanel("Demo")
  @unobservable readonly explorer: DemoExplorer
  private _isTaskOpened = false

  get isTaskOpened(): boolean { return this._isTaskOpened }

  constructor(demos: readonly Demo[] | null) {
    super()
    this._isTaskOpened = demos !== null
    this.explorer = new DemoExplorer(demos ?? [])
  }

  @transaction
  updateDemos(demos: readonly Demo[] | null): void {
    this._isTaskOpened = demos !== null
    this.explorer.updateDemos(demos ?? [])
  }

  override dispose(): void {
    Transaction.run(() => {
      this.leftPanel.dispose()
      super.dispose()
    })
  }
}
