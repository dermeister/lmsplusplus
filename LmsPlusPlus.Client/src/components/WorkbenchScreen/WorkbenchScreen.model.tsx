import { Axios } from "axios"
import React from "react"
import { cached, reaction, Ref, Transaction, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import { ObservableObject } from "../../ObservableObject"
import { IAuthService } from "../AuthService"
import { ContextMenuService } from "../ContextMenuService"
import { IErrorService } from "../ErrorService"
import { IScreen } from "../IScreen"
import { OptionsViewGroup } from "../OptionsViewGroup"
import { SidePanel } from "../SidePanel"
import { TasksViewGroup } from "../TasksViewGroup"
import { ViewGroup } from "../ViewGroup"
import * as view from "./WorkbenchScreen.view"

export class WorkbenchScreen extends ObservableObject implements IScreen {
    @unobservable private readonly _sidePanel: SidePanel
    @unobservable private readonly _tasksViewGroup: TasksViewGroup
    @unobservable private readonly _optionsViewGroup: OptionsViewGroup
    @unobservable private readonly _contextMenuService: ContextMenuService
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _errorService: IErrorService
    private _currentViewGroup: ViewGroup
    private _sidePanelTitle: string
    private _sidePanelShouldShowLoader: boolean

    constructor(api: Axios, authService: IAuthService, errorService: IErrorService) {
        super()
        this._contextMenuService = new ContextMenuService()
        this._errorService = errorService
        this._context = new DatabaseContext(api)
        this._tasksViewGroup = new TasksViewGroup("tasks-view-group", this._context, this._contextMenuService, this._errorService)
        this._optionsViewGroup = new OptionsViewGroup("options-view-group", authService, this._context)
        this._currentViewGroup = this._tasksViewGroup
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelShouldShowLoader = this._currentViewGroup.currentView.shouldShowLoader
        const titleRef = new Ref(this, "_sidePanelTitle")
        const isPulsingRef = new Ref(this, "_sidePanelShouldShowLoader")
        this._sidePanel = new SidePanel(titleRef, isPulsingRef)
    }

    override dispose(): void {
        Transaction.run(() => {
            this._sidePanel.dispose()
            this._tasksViewGroup.dispose()
            this._optionsViewGroup.dispose()
            this._context.dispose()
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
