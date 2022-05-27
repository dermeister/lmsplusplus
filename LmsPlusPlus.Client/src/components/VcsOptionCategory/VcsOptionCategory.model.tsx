import React from "react"
import { cached, Monitor, options, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { OptionCategory } from "../OptionCategory"
import * as view from "./VcsOptionCategory.view"

export class VcsOptionCategory extends OptionCategory {
    @unobservable private static readonly _monitor = Monitor.create("vcs-option-category", 0, 0)
    @unobservable private readonly _context: DatabaseContext

    override get isPerformingOperation(): boolean { return VcsOptionCategory._monitor.isActive }
    get theme(): string { return this._context.preferences.theme }
    get vcsProviders(): readonly domain.Provider[] { return this._context.providers }
    get vcsAccounts(): readonly domain.Account[] { return this._context.accounts }
    get vcsCurrentAccount(): domain.Account | null { return this._context.accounts.find(a => a.isActive) ?? null }

    constructor(context: DatabaseContext) {
        super()
        this._context = context
    }

    @cached
    render(): JSX.Element {
        return <view.VcsOptionCategory category={this} />
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async setActiveAccount(account: domain.Account): Promise<void> {
        await this._context.setActiveAccount(account)
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async deleteAccount(account: domain.Account): Promise<void> {
        await this._context.deleteAccount(account)
    }

    @transaction
    @options({ monitor: VcsOptionCategory._monitor })
    async addAccount(provider: domain.Provider): Promise<void> {
        await this._context.addAccount(provider)
    }
}
