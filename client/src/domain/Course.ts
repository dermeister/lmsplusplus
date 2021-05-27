import { cached, ObservableObject } from "reactronic";

import { Task } from "./Task";

export class Course extends ObservableObject {
  private _name: string;
  private _tasks: Task[];

  public constructor(name: string, tasks: Task[]) {
    super();
    this._name = name;
    this._tasks = tasks;
  }

  @cached
  public get name(): string {
    return this._name;
  }

  @cached
  public get tasks(): Task[] {
    return this._tasks;
  }
}
