import React from "react"
import { View } from "../View"
import viewSwitchButtonIcon from "../../assets/cog.svg"
import { MainContent, SidePanelContent } from "./OptionsView.view"
import { reaction, Ref, unobservable } from "reactronic"
import { OptionCategoriesExplorer } from "../OptionCategoriesExplorer"
import * as domain from "../../domain"
import { Options } from "../../models"
import { PreferencesOptionCategory } from "../PreferencesOptionCategory/PreferencesOptionCategory"
import { IViewService } from "../IViewService"
import { VcsOptionCategory } from "../VcsOptionCategory/VcsOptionCategory"
import { IOptionCategory } from "../IOptionCategory"
import { OptionCategory } from "../OptionCategoriesExplorer/OptionCategoriesExplorer.model"

export class OptionsViewModel extends View {
    private permissions = new domain.Permissions(1, true, true, true, true, true, true, true)
    @unobservable readonly categoriesExplorer = new OptionCategoriesExplorer(new Ref(this, "permissions"))
    private readonly options: Options = new Options(null!)
    private readonly _preferencesOptionCategory: PreferencesOptionCategory
    private readonly _vcsOptionCategory: VcsOptionCategory
    private _currentOptionCategory: IOptionCategory

    override get title(): string { return "Options" }
    get currentOptionCategory(): IOptionCategory { return this._currentOptionCategory }

    constructor(id: string) {
        super(id)
        this._preferencesOptionCategory = new PreferencesOptionCategory(this.options)
        this._vcsOptionCategory = new VcsOptionCategory(this.options)
        this._currentOptionCategory = this._preferencesOptionCategory
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
