import React from "react"
import * as domain from "../../domain"
import { autorender } from "../autorender"
import { Dropdown, DropdownItem } from "../Dropdown"
import { Field } from "../Field"
import * as model from "./VcsOptionCategory.model"
import styles from "./VcsOptionCategory.module.scss"

interface VcsOptionCategoryProps {
    category: model.VcsOptionCategory
}

export function VcsOptionCategory({ category }: VcsOptionCategoryProps): JSX.Element {
    function accountDropdown(): JSX.Element {
        const accounts = category.vcsAccounts.map(createAccountDropdownItem)
        return (
            <Dropdown items={accounts}
                onValueChange={a => category.setActiveAccount(a).catch(() => { })}
                selectedValue={category.vcsCurrentAccount}
                createPlaceholder={() => category.vcsCurrentAccount?.name ?? "Choose account"} />
        )
    }

    function createAccountDropdownItem(account: domain.Account): DropdownItem<domain.Account> {
        return { value: account, title: `${account.name} (${account.provider.name})` }
    }

    function providerList(): JSX.Element {
        return (
            <ul>
                {category.vcsProviders.map(provider => (
                    <li key={provider.id} className={styles.provider}>
                        <div className={styles.providerHeading}>
                            <h2 className={styles.providerName}>{provider.name}</h2>
                            <button className={styles.addAccount} onClick={() => category.addAccount(provider).catch(() => { })} />
                        </div>
                        {accountList(provider)}
                    </li>
                ))}
            </ul>
        )
    }

    function accountList(provider: domain.Provider): JSX.Element {
        return (
            <ul>
                {category.vcsAccounts.filter(account => account.provider === provider).map(account => (
                    <li key={account.id} className={styles.account}>
                        <button onClick={() => category.deleteAccount(account).catch(() => { })} className={styles.deleteAccount} />
                        <span className={styles.accountName}>{account.name}</span>
                    </li>
                ))}
            </ul>
        )
    }

    return autorender(() => {
        if (category.vcsProviders.length === 0)
            return <h2 className={styles.noVcsProviders}>There are no available VCS providers</h2>
        return (
            <div>
                <Field label="Current account" className={styles.currentAccountField}>
                    {accountDropdown()}
                </Field>
                {providerList()}
            </div>
        )
    }, [category])
}
