import React from "react"
import { cached, isnonreactive, Monitor, options, transaction, Transaction } from "reactronic"
import { Storage } from "../../api"
import * as domain from "../../domain"
import { IMessageService } from "../MessageService"
import { OptionCategory } from "../OptionCategory"
import { handleError } from "../utils"
import * as view from "./PreferencesOptionCategory.view"

export class PreferencesOptionCategory extends OptionCategory {
    @isnonreactive private static readonly _monitor = Monitor.create("preferences-option-category", 0, 0, 0)
    @isnonreactive private readonly _storage: Storage
    @isnonreactive private readonly _messageService: IMessageService

    override get isPerformingOperation(): boolean { return PreferencesOptionCategory._monitor.isActive }
    get theme(): string { return this._storage.preferences.theme }

    constructor(storage: Storage, messageService: IMessageService) {
        super()
        this._storage = storage
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
            await this._storage.updatePreferences(updatedPreferences)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }
}
