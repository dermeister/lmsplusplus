import { Storage } from "../api"
import viewGroupSwitchButtonIcon from "../assets/tasks.svg"
import { IContextMenuService } from "./ContextMenuService"
import { IMessageService } from "./MessageService"
import { TasksView } from "./TasksView"
import { ViewGroup } from "./ViewGroup"

export class TasksViewGroup extends ViewGroup {
    get iconUrl(): string { return viewGroupSwitchButtonIcon }

    constructor(id: string, storage: Storage, contextMenuService: IContextMenuService, messageService: IMessageService) {
        super(id)
        const tasksView = new TasksView(storage, this, contextMenuService, messageService)
        this.openView(tasksView)
    }
}
