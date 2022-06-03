import { Axios } from "axios"
import React from "react"
import { cached, isnonreactive, reaction, Ref, Transaction, transaction } from "reactronic"
import { DatabaseContext } from "../../database"
import { ObservableObject } from "../../ObservableObject"
import { IAuthService } from "../AuthService"
import { ContextMenuService } from "../ContextMenuService"
import { IMessageService } from "../MessageService"
import { IScreen } from "../IScreen"
import { OptionsViewGroup } from "../OptionsViewGroup"
import { SidePanel } from "../SidePanel"
import { TasksViewGroup } from "../TasksViewGroup"
import { ThemeService } from "../ThemeService"
import { ViewGroup } from "../ViewGroup"
import * as view from "./WorkbenchScreen.view"

export class WorkbenchScreen extends ObservableObject implements IScreen {
    @isnonreactive readonly sidePanel: SidePanel
    @isnonreactive private readonly _tasksViewGroup: TasksViewGroup
    @isnonreactive private readonly _optionsViewGroup: OptionsViewGroup
    @isnonreactive private readonly _contextMenuService: ContextMenuService
    @isnonreactive private readonly _context: DatabaseContext
    @isnonreactive private readonly _messageService: IMessageService
    @isnonreactive private readonly _themeService: ThemeService
    private _currentViewGroup: ViewGroup
    private _sidePanelTitle: string
    private _sidePanelShouldShowLoader: boolean

    get currentViewGroup(): ViewGroup { return this._currentViewGroup }
    get viewGroups(): readonly ViewGroup[] { return [this._tasksViewGroup, this._optionsViewGroup] }

    constructor(api: Axios, authService: IAuthService, messageService: IMessageService) {
        super()
        this._contextMenuService = new ContextMenuService()
        this._messageService = messageService
        this._context = new DatabaseContext(api, messageService)
        this._tasksViewGroup = new TasksViewGroup("tasks-view-group", this._context, this._contextMenuService, this._messageService)
        this._optionsViewGroup = new OptionsViewGroup("options-view-group", authService, this._context, this._messageService)
        this._currentViewGroup = this._tasksViewGroup
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelShouldShowLoader = this._currentViewGroup.currentView.shouldShowLoader
        const titleRef = new Ref(this, "_sidePanelTitle")
        const isPulsingRef = new Ref(this, "_sidePanelShouldShowLoader")
        this.sidePanel = new SidePanel(titleRef, isPulsingRef)
        this._themeService = new ThemeService(new Ref(this, "theme"))
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this.sidePanel.dispose()
            this._tasksViewGroup.dispose()
            this._optionsViewGroup.dispose()
            this._context.dispose()
            this._themeService.dispose()
            super.dispose()
        })
    }

    @cached
    render(): JSX.Element {
        return <view.WorkbenchScreen screen={this} />
    }

    @transaction
    showViewGroup(viewGroup: ViewGroup): void {
        this._currentViewGroup = viewGroup
    }

    @reaction
    private updateSidePanelRefs(): void {
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelShouldShowLoader = this._currentViewGroup.currentView.shouldShowLoader
    }
}
