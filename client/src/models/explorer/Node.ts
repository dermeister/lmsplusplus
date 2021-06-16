import { ObservableObject, unobservable } from "reactronic";
import { ContextMenu } from "../ContextMenu";

export class Node extends ObservableObject {
  private static nextId = 1;
  @unobservable public readonly title: string;
  @unobservable public readonly contextMenu = new ContextMenu();
  @unobservable public readonly id = Node.nextId++;

  public constructor(title: string) {
    super();
    this.title = title;
  }
}
