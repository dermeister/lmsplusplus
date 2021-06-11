import { cached, ObservableObject, transaction, unobservable } from "reactronic";

export class SidePanel extends ObservableObject {
  @unobservable public readonly title: string;
  private _opened = true;

  public constructor(title: string) {
    super();
    this.title = title;
  }

  @cached
  public get opened(): boolean {
    return this._opened;
  }

  @transaction
  public close(): void {
    this._opened = false;
  }

  @transaction
  public open(): void {
    this._opened = true;
  }
}
