import { ContextMenu } from "./ContextMenu";

export class WindowManager {
  private openedContextMenu: ContextMenu | null = null;

  public openContextMenu(contextMenu: ContextMenu, x: number, y: number): void {
    if (this.openedContextMenu !== null) this.closeContextMenu();
    contextMenu.open(x, y);
    this.openedContextMenu = contextMenu;
  }

  public closeContextMenu(): void {
    if (this.openedContextMenu !== null) {
      this.openedContextMenu?.close();
      this.openedContextMenu = null;
    }
  }
}
