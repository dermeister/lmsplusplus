import viewSwitchButtonIcon from "../assets/tasks.svg"
import { DatabaseContext } from "../database"
import { IContextMenuService } from "./ContextMenuService"
import { TasksView } from "./TasksView"
import { ViewGroup } from "./ViewGroup"

export class TasksViewGroup extends ViewGroup {
  get iconUrl(): string { return viewSwitchButtonIcon }

  constructor(id: string, context: DatabaseContext, contextMenuService: IContextMenuService) {
    super(id)
    const tasksView = new TasksView("task", context, this, contextMenuService)
    this.openView(tasksView)
  }
}
