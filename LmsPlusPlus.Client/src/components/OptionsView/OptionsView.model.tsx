import React from "react"
import { cached, isnonreactive, reaction, Ref, Transaction } from "reactronic"
import { DatabaseContext, IAuthService } from "../../api"
import { IMessageService } from "../MessageService"
import { OptionCategoriesExplorer } from "../OptionCategoriesExplorer"
import { OptionCategoryKind } from "../OptionCategoriesExplorer/OptionCategoriesExplorer.model"
import { OptionCategory } from "../OptionCategory"
import { PreferencesOptionCategory } from "../PreferencesOptionCategory"
import { VcsOptionCategory } from "../VcsOptionCategory"
import { View } from "../View"
import * as view from "./OptionsView.view"

export class OptionsView extends View {
    @isnonreactive readonly categoriesExplorer: OptionCategoriesExplorer
    @isnonreactive readonly authService: IAuthService
    @isnonreactive private readonly _preferencesOptionCategory: PreferencesOptionCategory
    @isnonreactive private readonly _vcsOptionCategory: VcsOptionCategory
    @isnonreactive private readonly _messageService: IMessageService
    private _currentOptionCategory: OptionCategory

    override get shouldShowLoader(): boolean { return this._currentOptionCategory.isPerformingOperation }
    override get title(): string { return "Options" }
    get currentOptionCategory(): OptionCategory { return this._currentOptionCategory }

    constructor(authService: IAuthService, context: DatabaseContext, messageService: IMessageService) {
        super()
        this._messageService = messageService
        this.categoriesExplorer = new OptionCategoriesExplorer(new Ref(context, "permissions"))
        this._preferencesOptionCategory = new PreferencesOptionCategory(context, messageService)
        this._vcsOptionCategory = new VcsOptionCategory(context, messageService)
        this._currentOptionCategory = this._preferencesOptionCategory
        this.authService = authService
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this.categoriesExplorer.dispose()
            this._preferencesOptionCategory.dispose()
            this._vcsOptionCategory.dispose()
            super.dispose()
        })
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <view.SidePanelContent view={this} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        return <view.MainPanelContent view={this} />
    }

    @reaction
    private updateCurrentCategory() {
        const item = this.categoriesExplorer.selectedNode?.item
        switch (item) {
            case OptionCategoryKind.Preferences:
                this._currentOptionCategory = this._preferencesOptionCategory
                break
            case OptionCategoryKind.Vcs:
                this._currentOptionCategory = this._vcsOptionCategory
                break
            default:
                break
        }
    }
}
