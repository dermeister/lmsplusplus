import React from "react"
import { cached, Monitor, options, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { OptionCategory } from "../OptionCategory"
import * as view from "./PreferencesOptionCategory.view"

export class PreferencesOptionCategory extends OptionCategory {
    @unobservable private static readonly _monitor = Monitor.create("preferences-option-category", 0, 0)
    @unobservable private readonly _context: DatabaseContext

    override get isPerformingOperation(): boolean { return PreferencesOptionCategory._monitor.isActive }
    get darkMode(): boolean { return this._context?.preferences.darkMode ?? true }

    constructor(context: DatabaseContext) {
        super()
        this._context = context
    }

    @cached
    render(): JSX.Element {
        return <view.PreferencesOptionCategory category={this} />
    }

    @transaction
    @options({ monitor: PreferencesOptionCategory._monitor })
    async setDarkMode(darkMode: boolean): Promise<void> {
        const updatedPreferences = new domain.Preferences(this._context.preferences.id, darkMode)
        await this._context.updatePreferences(updatedPreferences)
    }
}
