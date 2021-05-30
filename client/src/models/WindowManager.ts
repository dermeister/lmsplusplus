import { cached, ObservableObject, standalone, transaction } from "reactronic";
import { ContextMenu } from "./ContextMenu";

export class WindowManager extends ObservableObject {
  private _contextMenu: ContextMenu | null = null;

  @cached
  public get contextMenu(): ContextMenu | null {
    return this._contextMenu;
  }

  @transaction
  public openContextMenu(contextMenu: ContextMenu, x: number, y: number): void {
    if (this._contextMenu !== null) standalone(() => this.closeContextMenu());
    this._contextMenu = contextMenu;
    this._contextMenu.open(x, y);
  }

  @transaction
  public closeContextMenu(): void {
    if (this._contextMenu !== null) {
      this._contextMenu?.close();
      this._contextMenu = null;
    }
  }
}
