import { reaction, transaction, unobservable } from "reactronic"
import bitbucketIcon from "../assets/bitbucket.svg"
import githubIcon from "../assets/github.svg"
import gitlabIcon from "../assets/gitlab.svg"
import { Account, Provider, VcsConfiguration } from "../domain/VcsConfiguration"
import { ObservableObject } from "../ObservableObject"

export abstract class VscConfigurationRepository extends ObservableObject {
  protected _configuration = VcsConfiguration.default

  get configuration(): VcsConfiguration { return this._configuration }
}

export class VcsConfigurationRepositoryInternal extends VscConfigurationRepository {
  @unobservable private static nextProviderId = 1
  @unobservable private static nextAccountId = 1

  @transaction
  async update(configuration: VcsConfiguration): Promise<void> {
    await new Promise(r => setTimeout(r, 1000))

    this._configuration = configuration
  }

  @reaction
  private async vcs_configuration_fetched_from_api(): Promise<void> {
    const github = new Provider(VcsConfigurationRepositoryInternal.nextProviderId++,
      "GitHub",
      githubIcon)
    const bitbucket = new Provider(VcsConfigurationRepositoryInternal.nextProviderId++,
      "BitBucket",
      bitbucketIcon)
    const gitlab = new Provider(VcsConfigurationRepositoryInternal.nextProviderId++,
      "GitLab",
      gitlabIcon)
    const providers = [github, bitbucket, gitlab]
    const account1 = new Account(VcsConfigurationRepositoryInternal.nextAccountId++,
      github,
      "dermeister")
    const account2 = new Account(VcsConfigurationRepositoryInternal.nextAccountId++,
      github,
      "denis.duzh")
    const account3 = new Account(VcsConfigurationRepositoryInternal.nextAccountId++,
      bitbucket,
      "dermeister")
    const account4 = new Account(VcsConfigurationRepositoryInternal.nextAccountId++,
      bitbucket,
      "denis.duzh")
    const account5 = new Account(VcsConfigurationRepositoryInternal.nextAccountId++,
      gitlab,
      "dermeister")
    const account6 = new Account(VcsConfigurationRepositoryInternal.nextAccountId++,
      gitlab,
      "denis.duzh")
    const accounts = [account1, account2, account3, account4, account5, account6]
    this._configuration = new VcsConfiguration(providers, accounts, account1)
  }
}
