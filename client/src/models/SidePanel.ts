import { cached, ObservableObject, transaction, unobservable } from "reactronic"

export class SidePanel extends ObservableObject {
  @unobservable readonly title: string
  private _opened = true

  constructor(title: string) {
    super()
    this.title = title
  }

  @cached
  get opened(): boolean {
    return this._opened
  }

  @transaction
  close(): void {
    this._opened = false
  }

  @transaction
  open(): void {
    this._opened = true
  }
}
