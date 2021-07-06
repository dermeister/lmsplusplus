import { cached, ObservableObject } from "reactronic"

export class Task extends ObservableObject {
  private _title: string

  constructor(title: string) {
    super()
    this._title = title
  }

  @cached
  get title(): string {
    return this._title
  }
}
