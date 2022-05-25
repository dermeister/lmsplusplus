import React from "react"
import { cached, transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { OptionCategory } from "../OptionCategory"
import * as view from "./VcsOptionCategory.view"

export class VcsOptionCategory extends OptionCategory {
    @unobservable private readonly _context: DatabaseContext

    get darkMode(): boolean { return this._context?.preferences.darkMode ?? true }
    get vcsProviders(): readonly domain.Provider[] { return this._context?.vcsConfiguration.providers ?? [] }
    get vcsAccounts(): readonly domain.Account[] { return this._context?.vcsConfiguration.accounts ?? [] }
    get vcsCurrentAccount(): domain.Account | null { return this._context?.vcsConfiguration.currentAccount }

    constructor(context: DatabaseContext) {
        super()
        this._context = context
    }

    @cached
    render(): JSX.Element {
        return <view.VcsOptionCategory category={this} />
    }

    @transaction
    async setCurrentAccount(account: domain.Account): Promise<void> {
        throw new Error("Not implemented")
    }

    @transaction
    async deleteAccount(account: domain.Account): Promise<void> {
        throw new Error("Not implemented")
    }

    @transaction
    async addAccount(provider: domain.Provider): Promise<void> {
        throw new Error("Not implemented")
    }
}
