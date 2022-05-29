import { Axios } from "axios"
import React from "react"
import { cached, isnonreactive, reaction, Ref, Transaction, transaction } from "reactronic"
import { DatabaseContext } from "../../database"
import { ObservableObject } from "../../ObservableObject"
import { IAuthService } from "../AuthService"
import { ContextMenuService } from "../ContextMenuService"
import { IErrorService } from "../ErrorService"
import { IScreen } from "../IScreen"
import { OptionsViewGroup } from "../OptionsViewGroup"
import { SidePanel } from "../SidePanel"
import { TasksViewGroup } from "../TasksViewGroup"
import { ThemeService } from "../ThemeService"
import { ViewGroup } from "../ViewGroup"
import * as view from "./WorkbenchScreen.view"

export class WorkbenchScreen extends ObservableObject implements IScreen {
    @isnonreactive private readonly _sidePanel: SidePanel
    @isnonreactive private readonly _tasksViewGroup: TasksViewGroup
    @isnonreactive private readonly _optionsViewGroup: OptionsViewGroup
    @isnonreactive private readonly _contextMenuService: ContextMenuService
    @isnonreactive private readonly _context: DatabaseContext
    @isnonreactive private readonly _errorService: IErrorService
    @isnonreactive private readonly _themeService: ThemeService
    private _currentViewGroup: ViewGroup
    private _sidePanelTitle: string
    private _sidePanelShouldShowLoader: boolean

    private get theme(): string { return this._context.preferences.theme }

    constructor(api: Axios, authService: IAuthService, errorService: IErrorService) {
        super()
        this._contextMenuService = new ContextMenuService()
        this._errorService = errorService
        this._context = new DatabaseContext(api, errorService)
        this._tasksViewGroup = new TasksViewGroup("tasks-view-group", this._context, this._contextMenuService, this._errorService)
        this._optionsViewGroup = new OptionsViewGroup("options-view-group", authService, this._context, this._errorService)
        this._currentViewGroup = this._tasksViewGroup
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelShouldShowLoader = this._currentViewGroup.currentView.shouldShowLoader
        const titleRef = new Ref(this, "_sidePanelTitle")
        const isPulsingRef = new Ref(this, "_sidePanelShouldShowLoader")
        this._sidePanel = new SidePanel(titleRef, isPulsingRef)
        this._themeService = new ThemeService(new Ref(this, "theme"))
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this._sidePanel.dispose()
            this._tasksViewGroup.dispose()
            this._optionsViewGroup.dispose()
            this._context.dispose()
            this._themeService.dispose()
            super.dispose()
        })
    }

    @cached
    render(): JSX.Element {
        const viewGroups = [this._tasksViewGroup, this._optionsViewGroup]
        return (
            <view.WorkbenchScreen currentViewGroup={this._currentViewGroup}
                sidePanel={this._sidePanel}
                viewGroups={viewGroups}
                onShowViewGroup={v => this.showViewGroup(v)} />
        )
    }

    @transaction
    private showViewGroup(viewGroup: ViewGroup): void {
        this._currentViewGroup = viewGroup
    }

    @reaction
    private updateSidePanelRefs(): void {
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelShouldShowLoader = this._currentViewGroup.currentView.shouldShowLoader
    }
}
