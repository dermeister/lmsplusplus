import { transaction, unobservable } from "reactronic"
import { Database } from "../../database"
import * as domain from "../../domain"
import { ObservableObject } from "../../ObservableObject"

export class Options extends ObservableObject {
    @unobservable private readonly _database: Database

    get darkMode(): boolean { return this._database.preferences.darkMode }
    get vcsProviders(): readonly domain.Provider[] { return this._database.vcsConfiguration.providers }
    get vcsAccounts(): readonly domain.Account[] { return this._database.vcsConfiguration.accounts }
    get vcsCurrentAccount(): domain.Account | null { return this._database.vcsConfiguration.currentAccount }

    constructor(database: Database) {
        super()
        this._database = database
    }

    @transaction
    async setDarkMode(darkMode: boolean): Promise<void> {
        const updatedPreferences = new domain.Preferences(darkMode)
        await this._database.updatePreferences(updatedPreferences)
    }

    @transaction
    async setCurrentAccount(account: domain.Account): Promise<void> {
        const updatedVscConfiguration = this._database.vcsConfiguration.update({ currentAccount: account })
        await this._database.updateVcsConfiguration(updatedVscConfiguration)
    }

    @transaction
    async deleteAccount(account: domain.Account): Promise<void> {
        const accounts = this._database.vcsConfiguration.accounts.filter(a => a !== account)
        const { currentAccount } = this._database.vcsConfiguration
        const fields = { accounts, currentAccount: account === currentAccount ? null : currentAccount }
        const updatedVcsConfiguration = this._database.vcsConfiguration.update(fields)
        await this._database.updateVcsConfiguration(updatedVcsConfiguration)
    }
}
