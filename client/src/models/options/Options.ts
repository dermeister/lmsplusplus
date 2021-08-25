import { transaction, unobservable } from "reactronic"
import { Preferences } from "../../domain/Preferences"
import { Account, Provider, VcsConfiguration } from "../../domain/VcsConfiguration"
import { ObservableObject } from "../../ObservableObject"
import { PreferencesRepository, VscConfigurationRepository } from "../../repositories"

export class Options extends ObservableObject {
  @unobservable private readonly preferencesRepository: PreferencesRepository
  @unobservable private readonly vscConfigurationRepository: VscConfigurationRepository
  private _updatedPreferences: Preferences | null = null
  private _updatedVscConfiguration: VcsConfiguration | null = null

  get darkMode(): boolean { return this.preferencesRepository.preferences.darkMode }
  get vscProviders(): readonly Provider[] { return this.vscConfigurationRepository.configuration.providers }
  get vscAccounts(): readonly Account[] { return this.vscConfigurationRepository.configuration.accounts }
  get updatedPreferences(): Preferences | null { return this._updatedPreferences }
  get updatedVscConfiguration(): VcsConfiguration | null { return this._updatedVscConfiguration }

  constructor(preferences: PreferencesRepository, vscConfiguration: VscConfigurationRepository) {
    super()
    this.preferencesRepository = preferences
    this.vscConfigurationRepository = vscConfiguration
  }

  @transaction
  setDarkMode(darkMode: boolean): void {
    this._updatedPreferences = new Preferences(darkMode)
  }

  @transaction
  setVcsProviders(providers: readonly Provider[]): void {
    const { accounts } = this.vscConfigurationRepository.configuration
    this._updatedVscConfiguration = new VcsConfiguration(providers, accounts)
  }

  @transaction
  setVcsAccounts(accounts: readonly Account[]): void {
    const { providers } = this.vscConfigurationRepository.configuration
    this._updatedVscConfiguration = new VcsConfiguration(providers, accounts)
  }
}
