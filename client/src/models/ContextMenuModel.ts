import { cached, ObservableObject, transaction } from "reactronic";

export class ContextMenuModel extends ObservableObject {
  private _x: number = 0;
  private _y: number = 0;
  private _isOpened = false;

  @cached
  public get x(): number {
    return this._x;
  }

  @cached
  public get y(): number {
    return this._y;
  }

  @cached
  public get isOpened(): boolean {
    return this._isOpened;
  }

  @transaction
  public open(x: number, y: number): void {
    this._x = x;
    this._y = y;
    this._isOpened = true;
  }

  @transaction
  public close(): void {
    this._x = 0;
    this._y = 0;
    this._isOpened = false;
  }
}
