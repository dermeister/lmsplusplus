import { transaction, unobservable } from "reactronic"
import { DatabaseContext } from "../database"
import * as domain from "../domain"
import { ObservableObject } from "../ObservableObject"

export interface IOptionsService {
  darkMode: boolean

  vcsProviders: readonly domain.Provider[]

  vcsAccounts: readonly domain.Account[]

  vcsCurrentAccount: domain.Account | null

  setDarkMode(darkMode: boolean): void

  setCurrentAccount(account: domain.Account): Promise<void>

  deleteAccount(account: domain.Account): Promise<void>

  addAccount(provider: domain.Provider): Promise<void>
}

export class OptionsService extends ObservableObject implements IOptionsService {
  @unobservable private readonly _context: DatabaseContext

  get darkMode(): boolean { return this._context?.preferences.darkMode ?? true }
  get vcsProviders(): readonly domain.Provider[] { return this._context?.vcsConfiguration.providers ?? [] }
  get vcsAccounts(): readonly domain.Account[] { return this._context?.vcsConfiguration.accounts ?? [] }
  get vcsCurrentAccount(): domain.Account | null { return this._context?.vcsConfiguration.currentAccount }

  constructor(context: DatabaseContext) {
    super()
    this._context = context
  }

  @transaction
  async setDarkMode(darkMode: boolean): Promise<void> {
    const updatedPreferences = new domain.Preferences(this._context.preferences.id, darkMode)
    await this._context.updatePreferences(updatedPreferences)
  }

  @transaction
  async setCurrentAccount(account: domain.Account): Promise<void> {
    throw new Error("Not implemented")
  }

  @transaction
  async deleteAccount(account: domain.Account): Promise<void> {
    throw new Error("Not implemented")
  }

  @transaction
  async addAccount(provider: domain.Provider): Promise<void> {
    throw new Error("Not implemented")
  }
}
