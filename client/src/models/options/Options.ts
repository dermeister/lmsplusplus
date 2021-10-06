import { transaction, unobservable } from "reactronic"
import { ReadOnlyDatabase } from "../../database"
import * as domain from "../../domain"
import { ObservableObject } from "../../ObservableObject"

export class Options extends ObservableObject {
  @unobservable private readonly database: ReadOnlyDatabase
  private _updatedPreferences: domain.Preferences | null = null
  private _updatedVcsConfiguration: domain.VcsConfiguration | null = null

  get darkMode(): boolean { return this.preferences.darkMode }
  get vcsProviders(): readonly domain.Provider[] { return this.vcsConfiguration.providers }
  get vcsAccounts(): readonly domain.Account[] { return this.vcsConfiguration.accounts }
  get vcsCurrentAccount(): domain.Account | null { return this.vcsConfiguration.currentAccount }
  get updatedPreferences(): domain.Preferences | null { return this._updatedPreferences }
  get updatedVcsConfiguration(): domain.VcsConfiguration | null { return this._updatedVcsConfiguration }
  private get preferences(): domain.Preferences { return this.database.preferences }
  private get vcsConfiguration(): domain.VcsConfiguration { return this.database.vcsConfiguration }

  constructor(database: ReadOnlyDatabase) {
    super()
    this.database = database
  }

  @transaction
  setDarkMode(darkMode: boolean): void {
    this._updatedPreferences = new domain.Preferences(darkMode)
  }

  @transaction
  setCurrentAccount(account: domain.Account): void {
    this._updatedVcsConfiguration = this.vcsConfiguration.update({ currentAccount: account })
  }

  @transaction
  deleteAccount(account: domain.Account): void {
    const accounts = this.vcsAccounts.filter(a => a !== account)
    const { currentAccount } = this.vcsConfiguration
    const fields = { accounts, currentAccount: account === currentAccount ? null : currentAccount }
    this._updatedVcsConfiguration = this.vcsConfiguration.update(fields)
  }
}
