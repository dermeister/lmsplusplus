import { Axios } from "axios"
import React from "react"
import { cached, isnonreactive, reaction, Ref, Transaction, transaction } from "reactronic"
import { IAuthService, Storage } from "../../api"
import * as domain from "../../domain"
import { ObservableObject } from "../../ObservableObject"
import { ContextMenuService } from "../ContextMenuService"
import { IScreen } from "../IScreen"
import { IMessageService } from "../MessageService"
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
    @isnonreactive private readonly _storage: Storage
    @isnonreactive private readonly _messageService: IMessageService
    @isnonreactive private readonly _themeService: ThemeService
    private _currentViewGroup: ViewGroup
    private _sidePanelTitle: string
    private _sidePanelShouldShowLoader: boolean

    get currentViewGroup(): ViewGroup { return this._currentViewGroup }
    get viewGroups(): readonly ViewGroup[] { return [this._tasksViewGroup, this._optionsViewGroup] }
    private get sidePanelShouldShowLoader(): boolean { return this._sidePanelShouldShowLoader || this._storage.isLoadingData }
    private get theme(): string { return this._storage.preferences.theme }

    constructor(api: Axios, authService: IAuthService, messageService: IMessageService, themeService: ThemeService) {
        super()
        this._contextMenuService = new ContextMenuService()
        this._messageService = messageService
        this._storage = new Storage(api, messageService, authService)
        this._themeService = themeService
        this._tasksViewGroup = new TasksViewGroup("tasks-view-group", this._storage, this._contextMenuService, this._messageService,
            this._themeService)
        this._optionsViewGroup = new OptionsViewGroup("options-view-group", authService, this._storage, this._messageService, this._themeService)
        this._currentViewGroup = this._tasksViewGroup
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelShouldShowLoader = this._currentViewGroup.currentView.shouldShowLoader
        const titleRef = new Ref(this, "_sidePanelTitle")
        const shouldShowLoaderRef = new Ref(this, "sidePanelShouldShowLoader")
        this.sidePanel = new SidePanel(titleRef, shouldShowLoaderRef)
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this.sidePanel.dispose()
            this._tasksViewGroup.dispose()
            this._optionsViewGroup.dispose()
            this._storage.dispose()
            this._contextMenuService.dispose()
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
    private updateSidePanel(): void {
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelShouldShowLoader = this._currentViewGroup.currentView.shouldShowLoader
    }

    @reaction
    private updateTheme(): void {
        if (this._storage.preferences !== domain.Preferences.default)
            this._themeService.setTheme(this._storage.preferences.theme)
    }
}
