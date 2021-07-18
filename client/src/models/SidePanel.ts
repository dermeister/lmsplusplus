import { cached, transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class SidePanel extends ObservableObject {
  @unobservable readonly title: string
  private _isOpened = true

  @cached get isOpened(): boolean { return this._isOpened }

  constructor(title: string) {
    super()
    this.title = title
  }

  @transaction
  close(): void { this._isOpened = false }

  @transaction
  open(): void { this._isOpened = true }
}
