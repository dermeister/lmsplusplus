import React from "react"
import { cached, isnonreactive, Monitor, options, transaction, Transaction } from "reactronic"
import { Storage } from "../../api"
import * as domain from "../../domain"
import { IMessageService } from "../MessageService"
import { OptionCategory } from "../OptionCategory"
import { handleError } from "../utils"
import * as view from "./VcsOptionCategory.view"

export class VcsOptionCategory extends OptionCategory {
    @isnonreactive private static readonly _monitor = Monitor.create("vcs-option-category", 0, 0, 0)
    @isnonreactive private readonly _storage: Storage
    @isnonreactive private readonly _messageService: IMessageService

    override get isPerformingOperation(): boolean { return VcsOptionCategory._monitor.isActive }
    get theme(): string { return this._storage.preferences.theme }
    get vcsProviders(): readonly domain.Provider[] { return this._storage.providers }
    get vcsAccounts(): readonly domain.Account[] { return this._storage.accounts }
    get vcsCurrentAccount(): domain.Account | null { return this._storage.accounts.find(a => a.isActive) ?? null }

    constructor(storage: Storage, messageService: IMessageService) {
        super()
        this._storage = storage
        this._messageService = messageService
    }

    @cached
    render(): JSX.Element {
        return <view.VcsOptionCategory category={this} />
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async setActiveAccount(account: domain.Account): Promise<void> {
        try {
            await this._storage.setActiveAccount(account)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async deleteAccount(account: domain.Account): Promise<void> {
        try {
            await this._storage.deleteAccount(account)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async addAccount(provider: domain.Provider): Promise<void> {
        try {
            await this._storage.addAccount(provider)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }
}
