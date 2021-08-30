import { transaction, unobservable } from "reactronic"
import { ReadOnlyDatabase } from "../../database"
import { Preferences } from "../../domain/Preferences"
import { Account, Provider, VcsConfiguration } from "../../domain/VcsConfiguration"
import { ObservableObject } from "../../ObservableObject"

export class Options extends ObservableObject {
  @unobservable private readonly database: ReadOnlyDatabase
  private _updatedPreferences: Preferences | null = null
  private _updatedVcsConfiguration: VcsConfiguration | null = null

  get darkMode(): boolean { return this.preferences.darkMode }
  get vcsProviders(): readonly Provider[] { return this.vcsConfiguration.providers }
  get vcsAccounts(): readonly Account[] { return this.vcsConfiguration.accounts }
  get vcsCurrentAccount(): Account | null { return this.vcsConfiguration.currentAccount }
  get updatedPreferences(): Preferences | null { return this._updatedPreferences }
  get updatedVcsConfiguration(): VcsConfiguration | null { return this._updatedVcsConfiguration }
  private get preferences(): Preferences { return this.database.preferences }
  private get vcsConfiguration(): VcsConfiguration { return this.database.vcsConfiguration }

  constructor(database: ReadOnlyDatabase) {
    super()
    this.database = database
  }

  @transaction
  setDarkMode(darkMode: boolean): void {
    this._updatedPreferences = new Preferences(darkMode)
  }

  @transaction
  setCurrentAccount(account: Account): void {
    this._updatedVcsConfiguration = this.vcsConfiguration.update({ currentAccount: account })
  }

  @transaction
  deleteAccount(account: Account): void {
    const accounts = this.vcsAccounts.filter(a => a !== account)
    const { currentAccount } = this.vcsConfiguration
    const fields = { accounts, currentAccount: account === currentAccount ? null : currentAccount }
    this._updatedVcsConfiguration = this.vcsConfiguration.update(fields)
  }
}
