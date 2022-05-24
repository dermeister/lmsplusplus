import React from "react"
import { reaction, Ref, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import { IAuthService } from "../AuthService"
import { OptionCategoriesExplorer } from "../OptionCategoriesExplorer"
import { OptionCategoryKind } from "../OptionCategoriesExplorer/OptionCategoriesExplorer.model"
import { OptionCategory } from "../OptionCategory"
import { PreferencesOptionCategory } from "../PreferencesOptionCategory"
import { VcsOptionCategory } from "../VcsOptionCategory"
import { View } from "../View"
import { MainContent as MainPanelContent, SidePanelContent } from "./OptionsView.view"

export class OptionsViewModel extends View {
    @unobservable readonly categoriesExplorer: OptionCategoriesExplorer
    @unobservable private readonly _authService: IAuthService
    @unobservable private readonly _preferencesOptionCategory: PreferencesOptionCategory
    @unobservable private readonly _vcsOptionCategory: VcsOptionCategory
    private _currentOptionCategory: OptionCategory

    override get isPulsing(): boolean { return this._currentOptionCategory.isPerformingOperation }
    override get title(): string { return "Options" }
    get currentOptionCategory(): OptionCategory { return this._currentOptionCategory }

    constructor(authService: IAuthService, context: DatabaseContext) {
        super()
        this.categoriesExplorer = new OptionCategoriesExplorer(new Ref(context, "permissions"))
        this._preferencesOptionCategory = new PreferencesOptionCategory(context)
        this._vcsOptionCategory = new VcsOptionCategory(context)
        this._currentOptionCategory = this._preferencesOptionCategory
        this._authService = authService
    }

    override renderSidePanelContent(): JSX.Element {
        return <SidePanelContent model={this} authService={this._authService} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <MainPanelContent model={this} />
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
