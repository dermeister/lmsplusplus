export class Provider {
    readonly id: string
    readonly name: string
    readonly iconUrl: string

    constructor(id: string, name: string, iconUrl: string) {
        this.id = id
        this.name = name
        this.iconUrl = iconUrl
    }
}

export class Account {
    readonly id: number
    readonly provider: Provider
    readonly name: string
    readonly isActive: boolean

    constructor(id: number, provider: Provider, name: string, isActive: boolean) {
        this.id = id
        this.provider = provider
        this.name = name
        this.isActive = isActive
    }
}

export class VcsConfiguration {
    static readonly default = VcsConfiguration.createDefaultConfiguration()
    readonly providers: readonly Provider[]
    readonly accounts: readonly Account[]
    readonly currentAccount: Account | null = null

    constructor(providers: readonly Provider[], accounts: readonly Account[]) {
        this.providers = providers
        this.accounts = accounts
        this.currentAccount = accounts.find(a => a.isActive) ?? null
    }

    update(values: Partial<VcsConfiguration>): VcsConfiguration {
        const providers = values.providers !== undefined ? values.providers : this.providers
        const accounts = values.accounts !== undefined ? values.accounts : this.accounts
        return new VcsConfiguration(providers, accounts)
    }

    private static createDefaultConfiguration(): VcsConfiguration {
        return new VcsConfiguration([], [])
    }
}
