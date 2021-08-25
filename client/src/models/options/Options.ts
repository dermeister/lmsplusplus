import { Preferences } from "../../domain/Preferences"
import { Account, Provider, VscConfiguration } from "../../domain/VscConfiguration"
import { Database, PreferencesRepository, VscConfigurationRepository } from "../../repositories"

export class Options {
  private readonly preferencesRepository: PreferencesRepository
  private readonly vscConfigurationRepository: VscConfigurationRepository
  private readonly database: Database

  get darkMode(): boolean { return this.preferencesRepository.preferences.darkMode }
  get vscProviders(): readonly Provider[] { return this.vscConfigurationRepository.configuration.providers }
  get vscAccounts(): readonly Account[] { return this.vscConfigurationRepository.configuration.accounts }

  constructor(database: Database) {
    this.database = database
    this.preferencesRepository = this.database.preferencesRepository
    this.vscConfigurationRepository = this.database.vsConfigurationRepository
  }

  async setDarkMode(value: boolean): Promise<void> {
    const preferences = new Preferences(value)
    await this.database.updatePreferences(preferences)
  }

  async setVcsProviders(providers: readonly Provider[]): Promise<void> {
    const { accounts } = this.vscConfigurationRepository.configuration
    const vscConfiguration = new VscConfiguration(providers, accounts)
    await this.database.updateVscConfiguration(vscConfiguration)
  }

  async setVcsAccounts(accounts: readonly Account[]): Promise<void> {
    const { providers } = this.vscConfigurationRepository.configuration
    const vscConfiguration = new VscConfiguration(providers, accounts)
    await this.database.updateVscConfiguration(vscConfiguration)
  }
}
