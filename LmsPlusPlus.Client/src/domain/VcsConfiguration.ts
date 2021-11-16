import { Fields } from "./utils"

export class Provider {
  readonly id: number
  readonly name: string
  readonly iconUrl: string

  constructor(id: number, name: string, iconUrl: string) {
    this.id = id
    this.name = name
    this.iconUrl = iconUrl
  }
}

export class Account {
  readonly id: number
  readonly provider: Provider
  readonly username: string

  constructor(id: number, provider: Provider, username: string) {
    this.id = id
    this.provider = provider
    this.username = username
  }
}

export class VcsConfiguration {
  static readonly default = VcsConfiguration.createDefaultConfiguration()
  readonly providers: readonly Provider[]
  readonly accounts: readonly Account[]
  readonly currentAccount: Account | null = null

  constructor(providers: readonly Provider[], accounts: readonly Account[], selectedAccount: Account | null) {
    this.providers = providers
    this.accounts = accounts
    this.currentAccount = selectedAccount
  }

  update(values: Fields<VcsConfiguration>): VcsConfiguration {
    const providers = values.providers !== undefined ? values.providers : this.providers
    const accounts = values.accounts !== undefined ? values.accounts : this.accounts
    const currentAccount = values.currentAccount !== undefined ? values.currentAccount : this.currentAccount
    return new VcsConfiguration(providers, accounts, currentAccount)
  }

  private static createDefaultConfiguration(): VcsConfiguration {
    return new VcsConfiguration([], [], null)
  }
}
