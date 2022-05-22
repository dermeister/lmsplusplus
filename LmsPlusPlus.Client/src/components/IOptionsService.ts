import * as domain from "../domain"

export interface IOptionsService {
  darkMode: boolean;

  vcsProviders: readonly domain.Provider[]

  vcsAccounts: readonly domain.Account[]

  vcsCurrentAccount: domain.Account | null

  setDarkMode(darkMode: boolean): void

  setCurrentAccount(account: domain.Account): Promise<void>;

  deleteAccount(account: domain.Account): Promise<void>;

  addAccount(provider: domain.Provider): Promise<void>;
}
