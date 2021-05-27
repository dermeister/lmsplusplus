import { cached, ObservableObject } from "reactronic";

export class Task extends ObservableObject {
  private _title: string;

  public constructor(title: string) {
    super();
    this._title = title;
  }

  @cached
  public get title(): string {
    return this._title;
  }
}
