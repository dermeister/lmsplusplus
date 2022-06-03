import viewGroupSwitchButtonIcon from "../assets/tasks.svg"
import { DatabaseContext } from "../api"
import { IContextMenuService } from "./ContextMenuService"
import { IMessageService } from "./MessageService"
import { TasksView } from "./TasksView"
import { ViewGroup } from "./ViewGroup"

export class TasksViewGroup extends ViewGroup {
    get iconUrl(): string { return viewGroupSwitchButtonIcon }

    constructor(id: string, context: DatabaseContext, contextMenuService: IContextMenuService, messageService: IMessageService) {
        super(id)
        const tasksView = new TasksView(context, this, contextMenuService, messageService)
        this.openView(tasksView)
    }
}
