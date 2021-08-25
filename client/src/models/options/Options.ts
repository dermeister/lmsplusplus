import { transaction, unobservable } from "reactronic";
import { Preferences } from "../../domain/Preferences"
import { Account, Provider, VscConfiguration } from "../../domain/VscConfiguration"
import { ObservableObject } from "../../ObservableObject";
import { PreferencesRepository, VscConfigurationRepository } from "../../repositories"

export class Options extends ObservableObject {
  @unobservable private readonly preferencesRepository: PreferencesRepository
  @unobservable private readonly vscConfigurationRepository: VscConfigurationRepository
  private _updatedPreferences: Preferences | null = null
  private _updatedVcsConfiguration: VscConfiguration | null = null

  get darkMode(): boolean { return this.preferencesRepository.preferences.darkMode }
  get vscProviders(): readonly Provider[] { return this.vscConfigurationRepository.configuration.providers }
  get vscAccounts(): readonly Account[] { return this.vscConfigurationRepository.configuration.accounts }
  get updatedPreferences(): Preferences | null { return this._updatedPreferences }
  get updatedVcsConfiguration(): VscConfiguration | null { return this._updatedVcsConfiguration }

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
    this._updatedVcsConfiguration = new VscConfiguration(providers, accounts)
  }

  @transaction
  setVcsAccounts(accounts: readonly Account[]): void {
    const { providers } = this.vscConfigurationRepository.configuration
    this._updatedVcsConfiguration = new VscConfiguration(providers, accounts)
  }
}
