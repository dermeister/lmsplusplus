import { unobservable } from "reactronic";
import { Node } from "./Node";

export class ItemNode<T> extends Node {
  @unobservable public readonly title: string;
  @unobservable public readonly item: T;

  public constructor(title: string, item: T) {
    super(title);
    this.title = title;
    this.item = item;
  }
}
