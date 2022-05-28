import viewGroupSwitchButtonIcon from "../assets/tasks.svg"
import { DatabaseContext } from "../database"
import { IContextMenuService } from "./ContextMenuService"
import { IErrorService } from "./ErrorService"
import { TasksView } from "./TasksView"
import { ViewGroup } from "./ViewGroup"

export class TasksViewGroup extends ViewGroup {
    get iconUrl(): string { return viewGroupSwitchButtonIcon }

    constructor(id: string, context: DatabaseContext, contextMenuService: IContextMenuService, errorService: IErrorService) {
        super(id)
        const tasksView = new TasksView(context, this, contextMenuService, errorService)
        this.openView(tasksView)
    }
}
