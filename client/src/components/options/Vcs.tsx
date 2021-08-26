import React from "react"
import { Account, Provider } from "../../domain/VcsConfiguration"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Dropdown, DropdownItem } from "../Dropdown"
import { Field } from "../Field"
import styles from "./Vcs.module.scss"

interface VcsProps {
  model: models.Options
}

export function Vcs({ model }: VcsProps): JSX.Element {
  return autorender(() => {
    if (model.vcsProviders.length === 0)
      return <h2 className={styles.noVcs}>There are no available VCS providers</h2>

    if (model.vcsAccounts.length === 0)
      return providerDropdown(model)

    return (
      <>
        <Field label="Current account" className={styles.selectedAccountField}>
          {accountDropdown(model)}
        </Field>
        {providerList(model)}
      </>
    )
  }, [model])
}

function providerDropdown(options: models.Options): JSX.Element {
  const providers = options.vcsProviders.map(createProviderOrNullDropdownItem)
  if (providers.length === 0)
    throw new Error("No providers available")
  return (
    <Field label="Add VCS account">
      <Dropdown items={providers} placeholder="Select VCS provider" />
    </Field>
  )
}

function accountDropdown(options: models.Options): JSX.Element {
  if (!options.vcsCurrentAccount)
    throw new Error("Some account must be set to current by default")
  const selectedAccountIndex = options.vcsAccounts.indexOf(options.vcsCurrentAccount)
  const accounts = options.vcsAccounts.map(createAccountDropdownItem)
  return <Dropdown selectedItemIndex={selectedAccountIndex} items={accounts} />
}

function createProviderOrNullDropdownItem(provider: Provider): DropdownItem<Provider> {
  return { value: provider, title: provider.name, key: provider.id }
}

function createAccountDropdownItem(account: Account): DropdownItem<Account> {
  return { value: account, title: `${account.username} (${account.provider.name})`, key: account.id }
}

function providerList(options: models.Options): JSX.Element[] {
  return options.vcsProviders.map(p => (
    <ul key={p.name} className={styles.provider}>
      <div className={styles.providerHeading}>
        <h2 className={styles.providerName}>
          <img src={p.iconUrl} alt={p.name} width={11} height={11} className={styles.providerIcon} />
          {p.name}
        </h2>
        <button className={styles.addAccount} />
      </div>
      {accounts(options, p)}
    </ul>
  ))
}

function accounts(options: models.Options, provider: Provider): JSX.Element[] {
  return options.vcsAccounts.filter(a => a.provider === provider).map(a => (
    <li key={a.username} className={styles.account}>
      <button className={styles.deleteAccount} />
      <span className={styles.accountName}>{a.username}</span>
    </li>
  ))
}
