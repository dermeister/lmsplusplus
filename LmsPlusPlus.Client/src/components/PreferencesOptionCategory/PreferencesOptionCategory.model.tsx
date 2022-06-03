import React from "react"
import { cached, isnonreactive, Monitor, options, transaction, Transaction } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { IMessageService } from "../MessageService"
import { OptionCategory } from "../OptionCategory"
import { handleError } from "../utils"
import * as view from "./PreferencesOptionCategory.view"

export class PreferencesOptionCategory extends OptionCategory {
    @isnonreactive private static readonly _monitor = Monitor.create("preferences-option-category", 0, 0, 0)
    @isnonreactive private readonly _context: DatabaseContext
    @isnonreactive private readonly _messageService: IMessageService

    override get isPerformingOperation(): boolean { return PreferencesOptionCategory._monitor.isActive }
    get theme(): string { return this._context.preferences.theme }

    constructor(context: DatabaseContext, messageService: IMessageService) {
        super()
        this._context = context
        this._messageService = messageService
    }

    @cached
    render(): JSX.Element {
        return <view.PreferencesOptionCategory category={this} />
    }

    @transaction
    @options({ monitor: PreferencesOptionCategory._monitor })
    async setTheme(theme: string): Promise<void> {
        const updatedPreferences = new domain.Preferences(theme)
        try {
            await this._context.updatePreferences(updatedPreferences)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }
}
