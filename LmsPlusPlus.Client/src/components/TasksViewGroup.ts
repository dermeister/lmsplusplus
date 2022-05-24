import viewGroupSwitchButtonIcon from "../assets/tasks.svg"
import { DatabaseContext } from "../database"
import { IContextMenuService } from "./ContextMenuService"
import { TasksView } from "./TasksView"
import { ViewGroup } from "./ViewGroup"

export class TasksViewGroup extends ViewGroup {
  get iconUrl(): string { return viewGroupSwitchButtonIcon }

  constructor(id: string, context: DatabaseContext, contextMenuService: IContextMenuService) {
    super(id)
    const tasksView = new TasksView(context, this, contextMenuService)
    this.openView(tasksView)
  }
}
