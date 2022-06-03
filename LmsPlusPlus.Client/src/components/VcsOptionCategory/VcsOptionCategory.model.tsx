import React from "react"
import { cached, isnonreactive, Monitor, options, transaction, Transaction } from "reactronic"
import { DatabaseContext } from "../../api"
import * as domain from "../../domain"
import { IMessageService } from "../MessageService"
import { OptionCategory } from "../OptionCategory"
import { handleError } from "../utils"
import * as view from "./VcsOptionCategory.view"

export class VcsOptionCategory extends OptionCategory {
    @isnonreactive private static readonly _monitor = Monitor.create("vcs-option-category", 0, 0, 0)
    @isnonreactive private readonly _context: DatabaseContext
    @isnonreactive private readonly _messageService: IMessageService

    override get isPerformingOperation(): boolean { return VcsOptionCategory._monitor.isActive }
    get theme(): string { return this._context.preferences.theme }
    get vcsProviders(): readonly domain.Provider[] { return this._context.providers }
    get vcsAccounts(): readonly domain.Account[] { return this._context.accounts }
    get vcsCurrentAccount(): domain.Account | null { return this._context.accounts.find(a => a.isActive) ?? null }

    constructor(context: DatabaseContext, messageService: IMessageService) {
        super()
        this._context = context
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
            await this._context.setActiveAccount(account)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async deleteAccount(account: domain.Account): Promise<void> {
        try {
            await this._context.deleteAccount(account)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async addAccount(provider: domain.Provider): Promise<void> {
        try {
            await this._context.addAccount(provider)
        } catch (e) {
            Transaction.off(() => handleError(e, this._messageService))
        }
    }
}
