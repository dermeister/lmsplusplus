import React from "react"
import { cached, Monitor, options, transaction, isnonreactive, Transaction } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IErrorService } from "../ErrorService"
import { OptionCategory } from "../OptionCategory"
import * as view from "./PreferencesOptionCategory.view"

export class PreferencesOptionCategory extends OptionCategory {
    @isnonreactive private static readonly _monitor = Monitor.create("preferences-option-category", 0, 0, 0)
    @isnonreactive private readonly _context: DatabaseContext
    @isnonreactive private readonly _errorService: IErrorService

    override get isPerformingOperation(): boolean { return PreferencesOptionCategory._monitor.isActive }
    get theme(): string { return this._context.preferences.theme }

    constructor(context: DatabaseContext, errorService: IErrorService) {
        super()
        this._context = context
        this._errorService = errorService
    }

    @cached
    render(): JSX.Element {
        return <view.PreferencesOptionCategory category={this} />
    }

    @transaction
    @options({ monitor: PreferencesOptionCategory._monitor })
    async setDarkMode(theme: string): Promise<void> {
        const updatedPreferences = new domain.Preferences(theme)
        try {
            await this._context.updatePreferences(updatedPreferences)
        } catch (error) {
            Transaction.off(() => {
                if (error instanceof Error)
                    this._errorService.showError(error)
            })
        }
    }
}
