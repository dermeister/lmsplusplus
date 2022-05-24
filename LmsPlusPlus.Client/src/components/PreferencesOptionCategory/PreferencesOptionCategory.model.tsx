import React from "react"
import { Monitor, options, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { OptionCategory } from "../OptionCategory"
import { PreferencesOptionCategoryView } from "./PreferencesOptionCategory.view"

export class PreferencesOptionCategoryModel extends OptionCategory {
    @unobservable private static readonly s_monitor = Monitor.create("preferences-option-category", 0, 0)
    @unobservable private readonly _context: DatabaseContext

    override get isPerformingOperation(): boolean { return PreferencesOptionCategoryModel.s_monitor.isActive }
    get darkMode(): boolean { return this._context?.preferences.darkMode ?? true }

    constructor(context: DatabaseContext) {
        super()
        this._context = context
    }

    render(): JSX.Element {
        return <PreferencesOptionCategoryView model={this} />
    }

    @transaction
    @options({ monitor: PreferencesOptionCategoryModel.s_monitor })
    async setDarkMode(darkMode: boolean): Promise<void> {
        const updatedPreferences = new domain.Preferences(this._context.preferences.id, darkMode)
        await this._context.updatePreferences(updatedPreferences)
    }
}
