import React from "react"
import { reaction, Ref, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Options } from "../../models"
import { IAuthService } from "../AuthService"
import { IOptionCategory } from "../IOptionCategory"
import { OptionCategoriesExplorer } from "../OptionCategoriesExplorer"
import { OptionCategory } from "../OptionCategoriesExplorer/OptionCategoriesExplorer.model"
import { PreferencesOptionCategory } from "../PreferencesOptionCategory/PreferencesOptionCategory"
import { VcsOptionCategory } from "../VcsOptionCategory/VcsOptionCategory"
import { View } from "../View"
import { MainContent, SidePanelContent } from "./OptionsView.view"

export class OptionsViewModel extends View {
    private permissions = new domain.Permissions(1, true, true, true, true, true, true, true)
    @unobservable readonly categoriesExplorer = new OptionCategoriesExplorer(new Ref(this, "permissions"))
    @unobservable readonly authService: IAuthService
    private readonly options: Options = new Options(null!)
    private readonly _preferencesOptionCategory: PreferencesOptionCategory
    private readonly _vcsOptionCategory: VcsOptionCategory
    private _currentOptionCategory: IOptionCategory

    override get title(): string { return "Options" }
    get currentOptionCategory(): IOptionCategory { return this._currentOptionCategory }

    constructor(id: string, authService: IAuthService) {
        super(id)
        this._preferencesOptionCategory = new PreferencesOptionCategory(this.options)
        this._vcsOptionCategory = new VcsOptionCategory(this.options)
        this._currentOptionCategory = this._preferencesOptionCategory
        this.authService = authService
    }

    override renderSidePanelContent(): JSX.Element {
        return <SidePanelContent model={this} />
    }

    override renderMainPanelContent(): JSX.Element {
        return <MainContent model={this} />
    }

    @reaction
    private updateCurrentCategory() {
        const item = this.categoriesExplorer.selectedNode?.item
        switch (item) {
            case OptionCategory.Preferences:
                this._currentOptionCategory = this._preferencesOptionCategory
                break;
            case OptionCategory.Vcs:
                this._currentOptionCategory = this._vcsOptionCategory
                break;
            default:
                break;
        }
    }
}
