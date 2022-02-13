import { transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../../database"
import * as domain from "../../domain"
import { ObservableObject } from "../../ObservableObject"

export class Options extends ObservableObject {
    @unobservable private readonly _database: DatabaseContext

    get darkMode(): boolean { return this._database.preferences.darkMode }
    get vcsProviders(): readonly domain.Provider[] { return this._database.vcsConfiguration.providers }
    get vcsAccounts(): readonly domain.Account[] { return this._database.vcsConfiguration.accounts }
    get vcsCurrentAccount(): domain.Account | null { return this._database.vcsConfiguration.currentAccount }

    constructor(database: DatabaseContext) {
        super()
        this._database = database
    }

    @transaction
    async setDarkMode(darkMode: boolean): Promise<void> {
        const updatedPreferences = new domain.Preferences(this._database.preferences.id, darkMode)
        await this._database.updatePreferences(updatedPreferences)
    }

    @transaction
    async setCurrentAccount(account: domain.Account): Promise<void> {
        throw new Error("Not implemented")
    }

    @transaction
    async deleteAccount(account: domain.Account): Promise<void> {
        await this._database.deleteVcsAccount(account)
    }

    @transaction
    async addAccount(provider: domain.Provider): Promise<void> {
        await this._database.createVcsAccount(provider)
    }
}
