import React from "react"
import { cached, reaction, Ref, Transaction, isnonreactive } from "reactronic"
import { DatabaseContext } from "../../database"
import { IAuthService } from "../AuthService"
import { IErrorService } from "../ErrorService"
import { OptionCategoriesExplorer } from "../OptionCategoriesExplorer"
import { OptionCategoryKind } from "../OptionCategoriesExplorer/OptionCategoriesExplorer.model"
import { OptionCategory } from "../OptionCategory"
import { PreferencesOptionCategory } from "../PreferencesOptionCategory"
import { VcsOptionCategory } from "../VcsOptionCategory"
import { View } from "../View"
import * as view from "./OptionsView.view"

export class OptionsView extends View {
    @isnonreactive private readonly _categoriesExplorer: OptionCategoriesExplorer
    @isnonreactive private readonly _authService: IAuthService
    @isnonreactive private readonly _preferencesOptionCategory: PreferencesOptionCategory
    @isnonreactive private readonly _vcsOptionCategory: VcsOptionCategory
    @isnonreactive private readonly _errorService: IErrorService
    private _currentOptionCategory: OptionCategory

    override get shouldShowLoader(): boolean { return this._currentOptionCategory.isPerformingOperation }
    override get title(): string { return "Options" }

    constructor(authService: IAuthService, context: DatabaseContext, errorService: IErrorService) {
        super()
        this._errorService = errorService
        this._categoriesExplorer = new OptionCategoriesExplorer(new Ref(context, "permissions"))
        this._preferencesOptionCategory = new PreferencesOptionCategory(context, errorService)
        this._vcsOptionCategory = new VcsOptionCategory(context, errorService)
        this._currentOptionCategory = this._preferencesOptionCategory
        this._authService = authService
    }

    override dispose(): void {
        Transaction.run(null, () => {
            this._categoriesExplorer.dispose()
            this._preferencesOptionCategory.dispose()
            this._vcsOptionCategory.dispose()
            super.dispose()
        })
    }

    @cached
    override renderSidePanelContent(): JSX.Element {
        return <view.SidePanelContent categoriesExplorer={this._categoriesExplorer} authService={this._authService} />
    }

    @cached
    override renderMainPanelContent(): JSX.Element {
        return <view.MainPanelContent currentOptionCategory={this._currentOptionCategory} />
    }

    @reaction
    private updateCurrentCategory() {
        const item = this._categoriesExplorer.selectedNode?.item
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
