import React from "react";
import { cached, ObservableObject, reaction, Ref, transaction, unobservable } from "reactronic";
import { WorkbenchView } from "./Workbench.view";
import { SidePanel } from "../SidePanel";
import { View } from "../View";
import { TasksView } from "../TasksView";
import { OptionsView } from "../OptionsView";
import { IViewService } from "../IViewService";
import { DatabaseContext } from "../../database";
import { ViewGroup } from "../ViewGroup";
import { TasksViewGroup } from "../TasksViewGroup";
import { OptionsViewGroup } from "../OptionsViewGroup";
import { WindowManager } from "../../models";

export class WorkbenchModel extends ObservableObject {
    @unobservable readonly windowManager = new WindowManager()
    @unobservable readonly sidePanel: SidePanel
    @unobservable readonly context: DatabaseContext
    @unobservable private readonly _tasksViewGroup: TasksViewGroup
    @unobservable private readonly _optionsViewGroup: OptionsViewGroup
    private _currentViewGroup: ViewGroup
    private _sidePanelTitle: string
    private _sidePanelIsPulsing: boolean

    get currentViewGroup(): ViewGroup { return this._currentViewGroup }
    @cached get viewGroups(): readonly ViewGroup[] { return [this._tasksViewGroup, this._optionsViewGroup] }

    constructor(context: DatabaseContext) {
        super()
        this.context = context
        this._tasksViewGroup = new TasksViewGroup("tasks-view-group", context)
        this._optionsViewGroup = new OptionsViewGroup("options-view-group")
        this._currentViewGroup = this._tasksViewGroup
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelIsPulsing = this._currentViewGroup.currentView.isPulsing
        const titleRef = new Ref(this, "_sidePanelTitle")
        const isPulsingRef = new Ref(this, "_sidePanelIsPulsing")
        this.sidePanel = new SidePanel(titleRef, isPulsingRef)
    }

    @transaction
    showViewGroup(viewGroup: ViewGroup): void {
        this._currentViewGroup = viewGroup
    }

    render(): JSX.Element {
        return <WorkbenchView model={this} />
    }

    @reaction
    private updateSidePanelRefs(): void {
        this._sidePanelTitle = this._currentViewGroup.currentView.title
        this._sidePanelIsPulsing = this._currentViewGroup.currentView.isPulsing
    }
}






