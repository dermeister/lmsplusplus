import React from "react"
import { cached, reaction, Ref, Transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import { IAuthService } from "../AuthService"
import { OptionCategoriesExplorer } from "../OptionCategoriesExplorer"
import { OptionCategoryKind } from "../OptionCategoriesExplorer/OptionCategoriesExplorer.model"
import { OptionCategory } from "../OptionCategory"
import { PreferencesOptionCategory } from "../PreferencesOptionCategory"
import { VcsOptionCategory } from "../VcsOptionCategory"
import { View } from "../View"
import * as view from "./OptionsView.view"

export class OptionsView extends View {
    @unobservable private readonly _categoriesExplorer: OptionCategoriesExplorer
    @unobservable private readonly _authService: IAuthService
    @unobservable private readonly _preferencesOptionCategory: PreferencesOptionCategory
    @unobservable private readonly _vcsOptionCategory: VcsOptionCategory
    private _currentOptionCategory: OptionCategory

    override get isPulsing(): boolean { return this._currentOptionCategory.isPerformingOperation }
    override get title(): string { return "Options" }

    constructor(authService: IAuthService, context: DatabaseContext) {
        super()
        this._categoriesExplorer = new OptionCategoriesExplorer(new Ref(context, "permissions"))
        this._preferencesOptionCategory = new PreferencesOptionCategory(context)
        this._vcsOptionCategory = new VcsOptionCategory(context)
        this._currentOptionCategory = this._preferencesOptionCategory
        this._authService = authService
    }

    override dispose(): void {
        Transaction.run(() => {
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
