import { cached, ObservableObject, transaction } from "reactronic";

export class SidePanelModel extends ObservableObject {
  private _opened = false;

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
