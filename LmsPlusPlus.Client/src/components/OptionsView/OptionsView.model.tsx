import React from "react"
import { cached, isnonreactive, reaction, Ref, Transaction } from "reactronic"
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
    @isnonreactive readonly categoriesExplorer: OptionCategoriesExplorer
    @isnonreactive readonly authService: IAuthService
    @isnonreactive private readonly _preferencesOptionCategory: PreferencesOptionCategory
    @isnonreactive private readonly _vcsOptionCategory: VcsOptionCategory
    @isnonreactive private readonly _errorService: IErrorService
    private _currentOptionCategory: OptionCategory

    override get shouldShowLoader(): boolean { return this._currentOptionCategory.isPerformingOperation }
    override get title(): string { return "Options" }
    get currentOptionCategory(): OptionCategory { return this._currentOptionCategory }

    constructor(authService: IAuthService, context: DatabaseContext, errorService: IErrorService) {
        super()
        this._errorService = errorService
        this.categoriesExplorer = new OptionCategoriesExplorer(new Ref(context, "permissions"))
        this._preferencesOptionCategory = new PreferencesOptionCategory(context, errorService)
        this._vcsOptionCategory = new VcsOptionCategory(context, errorService)
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
