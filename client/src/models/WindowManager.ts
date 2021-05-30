import { cached, ObservableObject, standalone, transaction } from "reactronic";

import { ContextMenuModel } from "./ContextMenuModel";

export class WindowManagerModel extends ObservableObject {
  private _contextMenu: ContextMenuModel | null = null;

  @cached
  public get contextMenu(): ContextMenuModel | null {
    return this._contextMenu;
  }

  @transaction
  public openContextMenu(contextMenu: ContextMenuModel, x: number, y: number): void {
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
