import { isnonreactive } from "reactronic"
import { Storage } from "../api"
import viewGroupSwitchButtonDarkIcon from "../assets/tasks-dark.svg"
import viewGroupSwitchButtonLightIcon from "../assets/tasks-light.svg"
import { IContextMenuService } from "./ContextMenuService"
import { IMessageService } from "./MessageService"
import { TasksView } from "./TasksView"
import { IThemeService } from "./ThemeService"
import { ViewGroup } from "./ViewGroup"

export class TasksViewGroup extends ViewGroup {
    @isnonreactive private readonly _themeService: IThemeService

    get iconUrl(): string { return this._themeService.theme === "Dark" ? viewGroupSwitchButtonDarkIcon : viewGroupSwitchButtonLightIcon }

    constructor(id: string, storage: Storage, contextMenuService: IContextMenuService, messageService: IMessageService, themeService: IThemeService) {
        super(id)
        const tasksView = new TasksView(storage, this, contextMenuService, messageService, themeService)
        this.openView(tasksView)
        this._themeService = themeService
    }
}
