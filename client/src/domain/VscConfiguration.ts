export class Provider {
  readonly name: string

  constructor(name: string) { this.name = name }
}

export class Account {
  readonly provider: Provider
  readonly username: string

  constructor(provider: Provider, username: string) {
    this.provider = provider
    this.username = username
  }
}

export class VscConfiguration {
  static readonly default = VscConfiguration.createDefaultConfiguration()
  readonly providers: readonly Provider[]
  readonly accounts: readonly Account[]

  constructor(providers: readonly Provider[], accounts: readonly Account[]) {
    this.providers = providers
    this.accounts = accounts
  }

  private static createDefaultConfiguration(): VscConfiguration {
    const github = new Provider("GitHub")
    const bitbucket = new Provider("BitBucket")
    const gitlab = new Provider("GitLab")
    const providers = [github, bitbucket, gitlab]
    const account = new Account(github, "dermeister")
    const accounts = [account]
    return new VscConfiguration(providers, accounts)
  }
}
