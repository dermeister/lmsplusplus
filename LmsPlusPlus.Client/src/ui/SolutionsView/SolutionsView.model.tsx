import React from "react"
import { cached, isnonreactive, Transaction, transaction } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { ISolutionsService } from "../ISolutionsService"
import { SolutionsExplorer } from "../SolutionsExplorer"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import * as view from "./SolutionsView.view"

export class SolutionsView extends View {
    @isnonreactive readonly solutionsExplorer: SolutionsExplorer
    @isnonreactive private readonly _viewGroup: ViewGroup

    get title(): string { return "Solutions" }

    constructor(viewGroup: ViewGroup, groups: readonly domain.Group[], solutions: readonly domain.Solution[], solutionsService: ISolutionsService,
        contextMenuService: IContextMenuService) {
        super()
        this._viewGroup = viewGroup
        this.solutionsExplorer = new SolutionsExplorer(groups, solutions, solutionsService, contextMenuService)
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this.solutionsExplorer.dispose()
            super.dispose()
        })
    }

    @cached
    public renderMainPanelContent(): JSX.Element {
        return <view.SolutionsViewMainPanelContent />
    }

    @cached
    public renderSidePanelContent(): JSX.Element {
        return <view.SolutionsViewSidePanelContent view={this} />
    }

    @transaction
    close(): void {
        this._viewGroup.returnToPreviousView()
    }
}
