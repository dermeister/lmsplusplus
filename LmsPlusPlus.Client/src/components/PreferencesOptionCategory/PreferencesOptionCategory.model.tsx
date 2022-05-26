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
    get theme(): string { return this._context.preferences.theme }

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
    async setDarkMode(theme: string): Promise<void> {
        const updatedPreferences = new domain.Preferences(theme)
        await this._context.updatePreferences(updatedPreferences)
    }
}
