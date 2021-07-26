class Provider {
  readonly name: string

  constructor(name: string) { this.name = name }
}

class Account {
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

  constructor() {
    const github = new Provider("GitHub")
    const bitbucket = new Provider("BitBucket")
    const gitlab = new Provider("GitLab")
    this.providers = [github, bitbucket, gitlab]
    const account = new Account(github, "dermeister")
    this.accounts = [account]
  }

  private static createDefaultConfiguration(): VscConfiguration { return new VscConfiguration() }
}
