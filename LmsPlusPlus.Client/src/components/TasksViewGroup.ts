import { unobservable } from "reactronic";
import viewSwitchButtonIcon from "../assets/tasks.svg"
import { DatabaseContext } from "../database";
import { IViewService } from "./IViewService";
import { TasksView } from "./TasksView";
import { ViewGroup } from "./ViewGroup";

export class TasksViewGroup extends ViewGroup {
  get iconUrl(): string { return viewSwitchButtonIcon }

  constructor(id: string, context: DatabaseContext) {
    super(id)
    const tasksView = new TasksView("task", context, this)
    this.openView(tasksView)
  }
}
