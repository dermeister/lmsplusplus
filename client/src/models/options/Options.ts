import { transaction } from "reactronic"
import { Preferences } from "../../domain/Preferences"
import { Account, Provider, VcsConfiguration } from "../../domain/VcsConfiguration"
import { ObservableObject } from "../../ObservableObject"

export class Options extends ObservableObject {
  private _preferences: Preferences
  private _vcsConfiguration: VcsConfiguration
  private _updatedPreferences: Preferences | null = null
  private _updatedVcsConfiguration: VcsConfiguration | null = null

  get darkMode(): boolean { return this._preferences.darkMode }
  get vcsProviders(): readonly Provider[] { return this._vcsConfiguration.providers }
  get vcsAccounts(): readonly Account[] { return this._vcsConfiguration.accounts }
  get vcsCurrentAccount(): Account | null { return this._vcsConfiguration.currentAccount }
  get updatedPreferences(): Preferences | null { return this._updatedPreferences }
  get updatedVcsConfiguration(): VcsConfiguration | null { return this._updatedVcsConfiguration }

  constructor(preferences: Preferences, vcsConfiguration: VcsConfiguration) {
    super()
    this._preferences = preferences
    this._vcsConfiguration = vcsConfiguration
  }

  @transaction
  update(preferences: Preferences, vcsConfiguration: VcsConfiguration): void {
    this._preferences = preferences
    this._vcsConfiguration = vcsConfiguration
  }

  @transaction
  setDarkMode(darkMode: boolean): void {
    this._updatedPreferences = new Preferences(darkMode)
  }

  @transaction
  setCurrentAccount(account: Account): void {
    this._updatedVcsConfiguration = this._vcsConfiguration.update({ currentAccount: account })
  }

  @transaction
  deleteAccount(account: Account): void {
    const accounts = this.vcsAccounts.filter(a => a !== account)
    const { currentAccount } = this._vcsConfiguration
    const fields = { accounts, currentAccount: account === currentAccount ? null : currentAccount }
    this._updatedVcsConfiguration = this._vcsConfiguration.update(fields)
  }
}
