import React from "react"
import { cached, reaction, Ref, Transaction, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import { ObservableObject } from "../../ObservableObject"
import { IAuthService } from "../AuthService"
import { ContextMenuService } from "../ContextMenuService"
import { OptionsService } from "../Options"
import { OptionsViewGroup } from "../OptionsViewGroup"
import { SidePanel } from "../SidePanel"
import { TasksViewGroup } from "../TasksViewGroup"
import { ViewGroup } from "../ViewGroup"
import { WorkbenchScreenView } from "./WorkbenchScreen.view"

export class WorkbenchScreenModel extends ObservableObject {
    @unobservable readonly sidePanel: SidePanel
    @unobservable private readonly _context: DatabaseContext
    @unobservable private readonly _tasksViewGroup: TasksViewGroup
    @unobservable private readonly _optionsViewGroup: OptionsViewGroup
    @unobservable private readonly _optionsService: OptionsService
    @unobservable private readonly _contextMenuService: ContextMenuService
    private _currentViewGroup: ViewGroup
    private _sidePanelTitle: string
    private _sidePanelIsPulsing: boolean

    get currentViewGroup(): ViewGroup { return this._currentViewGroup }
    @cached get viewGroups(): readonly ViewGroup[] { return [this._tasksViewGroup, this._optionsViewGroup] }

    constructor(context: DatabaseContext, authService: IAuthService) {
        super()
        this._context = context
        this._contextMenuService = new ContextMenuService()
        this._optionsService = new OptionsService(this._context)
        this._tasksViewGroup = new TasksViewGroup("tasks-view-group", context, this._contextMenuService)
        this._optionsViewGroup = new OptionsViewGroup("options-view-group", authService, context, this._optionsService)
        this._currentViewGroup = this._tasksViewGroup
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelIsPulsing = this._currentViewGroup.currentView.isPulsing
        const titleRef = new Ref(this, "_sidePanelTitle")
        const isPulsingRef = new Ref(this, "_sidePanelIsPulsing")
        this.sidePanel = new SidePanel(titleRef, isPulsingRef)
    }

    override dispose(): void {
        Transaction.run(() => {
            this.sidePanel.dispose()
            this._tasksViewGroup.dispose()
            this._optionsViewGroup.dispose()
            this._optionsService.dispose()
            super.dispose()
        })
    }

    render(): JSX.Element {
        return <WorkbenchScreenView model={this} />
    }

    @transaction
    showViewGroup(viewGroup: ViewGroup): void {
        this._currentViewGroup = viewGroup
    }

    @reaction
    private updateSidePanelRefs(): void {
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelIsPulsing = this._currentViewGroup.currentView.isPulsing
    }
}







