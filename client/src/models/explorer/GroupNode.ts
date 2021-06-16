import { cached, transaction, unobservable } from "reactronic";
import { Node } from "./Node";

export class GroupNode extends Node {
  @unobservable public readonly title: string;
  @unobservable public readonly children: Node[];
  private _isOpened = false;

  public constructor(title: string, children: Node[] = []) {
    super(title);
    this.title = title;
    this.children = children;
  }

  @cached
  public get isOpened(): boolean {
    return this._isOpened;
  }

  @transaction
  public toggle(): void {
    this._isOpened = !this._isOpened;
  }
}
