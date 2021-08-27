import { transaction, unobservable } from "reactronic"
import { Preferences } from "../../domain/Preferences"
import { Account, Provider, VcsConfiguration } from "../../domain/VcsConfiguration"
import { ObservableObject } from "../../ObservableObject"
import { PreferencesRepository, VcsConfigurationRepository } from "../../repositories"

export class Options extends ObservableObject {
  @unobservable private readonly preferencesRepository: PreferencesRepository
  @unobservable private readonly vcsConfigurationRepository: VcsConfigurationRepository
  private _updatedPreferences: Preferences | null = null
  private _updatedVcsConfiguration: VcsConfiguration | null = null

  private get vcsConfiguration(): VcsConfiguration { return this.vcsConfigurationRepository.configuration }
  get darkMode(): boolean { return this.preferencesRepository.preferences.darkMode }
  get vcsProviders(): readonly Provider[] { return this.vcsConfiguration.providers }
  get vcsAccounts(): readonly Account[] { return this.vcsConfiguration.accounts }
  get vcsCurrentAccount(): Account | null { return this.vcsConfiguration.currentAccount }
  get updatedPreferences(): Preferences | null { return this._updatedPreferences }
  get updatedVcsConfiguration(): VcsConfiguration | null { return this._updatedVcsConfiguration }

  constructor(preferences: PreferencesRepository, vscConfiguration: VcsConfigurationRepository) {
    super()
    this.preferencesRepository = preferences
    this.vcsConfigurationRepository = vscConfiguration
  }

  @transaction
  setDarkMode(darkMode: boolean): void {
    this._updatedPreferences = new Preferences(darkMode)
  }

  @transaction
  setSelectedAccount(account: Account): void {
    let { providers, accounts } = this.vcsConfigurationRepository.configuration
    this._updatedVcsConfiguration = new VcsConfiguration(providers, accounts, account)
  }

  @transaction
  deleteAccount(account: Account): void {
    const updatedAccounts = this.vcsAccounts.filter(a => a !== account)
    let { providers, currentAccount } = this.vcsConfigurationRepository.configuration
    if (account === currentAccount)
      currentAccount = null
    this._updatedVcsConfiguration = new VcsConfiguration(providers, updatedAccounts, currentAccount)
  }
}
