import React from "react"
import { cached, reaction, Ref, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import { WindowManager } from "../../models"
import { ObservableObject } from "../../ObservableObject"
import { IAuthService } from "../AuthService"
import { OptionsService } from "../Options"
import { OptionsViewGroup } from "../OptionsViewGroup"
import { SidePanel } from "../SidePanel"
import { TasksViewGroup } from "../TasksViewGroup"
import { ViewGroup } from "../ViewGroup"
import { WorkbenchView } from "./Workbench.view"

export class WorkbenchScreenModel extends ObservableObject {
    @unobservable readonly windowManager = new WindowManager()
    @unobservable readonly sidePanel: SidePanel
    @unobservable readonly context: DatabaseContext
    @unobservable private readonly _tasksViewGroup: TasksViewGroup
    @unobservable private readonly _optionsViewGroup: OptionsViewGroup
    @unobservable private readonly _optionsService: OptionsService
    private _currentViewGroup: ViewGroup
    private _sidePanelTitle: string
    private _sidePanelIsPulsing: boolean

    get currentViewGroup(): ViewGroup { return this._currentViewGroup }
    @cached get viewGroups(): readonly ViewGroup[] { return [this._tasksViewGroup, this._optionsViewGroup] }

    constructor(context: DatabaseContext, authService: IAuthService) {
        super()
        this.context = context
        this._optionsService = new OptionsService(this.context)
        this._tasksViewGroup = new TasksViewGroup("tasks-view-group", context)
        this._optionsViewGroup = new OptionsViewGroup("options-view-group", authService, context, this._optionsService)
        this._currentViewGroup = this._tasksViewGroup
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelIsPulsing = this._currentViewGroup.currentView.isPulsing
        const titleRef = new Ref(this, "_sidePanelTitle")
        const isPulsingRef = new Ref(this, "_sidePanelIsPulsing")
        this.sidePanel = new SidePanel(titleRef, isPulsingRef)
    }

    render(): JSX.Element {
        return <WorkbenchView model={this} />
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







