import { transaction, unobservable } from "reactronic"
import { Database } from "../../database"
import * as domain from "../../domain"
import { ObservableObject } from "../../ObservableObject"

export class Options extends ObservableObject {
    @unobservable private readonly database: Database

    get darkMode(): boolean { return this.database.preferences.darkMode }
    get vcsProviders(): readonly domain.Provider[] { return this.database.vcsConfiguration.providers }
    get vcsAccounts(): readonly domain.Account[] { return this.database.vcsConfiguration.accounts }
    get vcsCurrentAccount(): domain.Account | null { return this.database.vcsConfiguration.currentAccount }

    constructor(database: Database) {
        super()
        this.database = database
    }

    @transaction
    async setDarkMode(darkMode: boolean): Promise<void> {
        const updatedPreferences = new domain.Preferences(darkMode)
        await this.database.updatePreferences(updatedPreferences)
    }

    @transaction
    async setCurrentAccount(account: domain.Account): Promise<void> {
        const updatedVscConfiguration = this.database.vcsConfiguration.update({ currentAccount: account })
        await this.database.updateVcsConfiguration(updatedVscConfiguration)
    }

    @transaction
    async deleteAccount(account: domain.Account): Promise<void> {
        const accounts = this.database.vcsConfiguration.accounts.filter(a => a !== account)
        const { currentAccount } = this.database.vcsConfiguration
        const fields = { accounts, currentAccount: account === currentAccount ? null : currentAccount }
        const updatedVcsConfiguration = this.database.vcsConfiguration.update(fields)
        await this.database.updateVcsConfiguration(updatedVcsConfiguration)
    }
}
