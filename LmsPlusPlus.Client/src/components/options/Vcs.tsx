import React from "react"
import * as domain from "../../domain"
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
            return <h2 className={styles.noVcsProviders}>There are no available VCS providers</h2>
        else
            return (
                <div>
                    <Field label="Current account" className={styles.currentAccountField}>
                        {accountDropdown(model)}
                    </Field>
                    {providerList(model)}
                </div>
            )
    }, [model])
}

function accountDropdown(options: models.Options): JSX.Element {
    async function onChange(account: domain.Account): Promise<void> {
        await options.setCurrentAccount(account)
    }

    const accounts = options.vcsAccounts.map(createAccountDropdownItem)
    if (!options.vcsCurrentAccount)
        return <Dropdown items={accounts} onValueChange={onChange} placeholder="Choose account" />
    return <Dropdown selectedValue={options.vcsCurrentAccount} items={accounts} onValueChange={onChange} />
}

function createAccountDropdownItem(account: domain.Account): DropdownItem<domain.Account> {
    return { value: account, title: `${account.username} (${account.provider.name})` }
}

function providerList(options: models.Options): JSX.Element {
    return (
        <ul>
            {options.vcsProviders.map(provider => (
                <li key={provider.id} className={styles.provider}>
                    <div className={styles.providerHeading}>
                        <h2 className={styles.providerName}>
                            <img src={provider.iconUrl}
                                 alt={provider.name}
                                 width={11}
                                 height={11}
                                 className={styles.providerIcon} />
                            {provider.name}
                        </h2>
                        <button className={styles.addAccount} />
                    </div>
                    {accountList(options, provider)}
                </li>
            ))}
        </ul>
    )
}

function accountList(options: models.Options, provider: domain.Provider): JSX.Element {
    return (
        <ul>
            {options.vcsAccounts.filter(account => account.provider === provider).map(account => (
                <li key={account.id} className={styles.account}>
                    <button onClick={() => options.deleteAccount(account)} className={styles.deleteAccount} />
                    <span className={styles.accountName}>{account.username}</span>
                </li>
            ))}
        </ul>
    )
}
