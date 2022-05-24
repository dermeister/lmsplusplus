import React from "react"
import * as domain from "../../domain"
import { autorender } from "../autorender"
import { Dropdown, DropdownItem } from "../Dropdown"
import { Field } from "../Field"
import { VcsOptionCategoryModel } from "./VcsOptionCategory.model"
import styles from "./VcsOptionCategory.module.scss"

interface VcsOptionCategoryViewProps {
    model: VcsOptionCategoryModel
}

export function VcsOptionCategoryView({ model }: VcsOptionCategoryViewProps): JSX.Element {
    return autorender(() => {
        if (model.vcsProviders.length === 0)
            return <h2 className={styles.noVcsProviders}>There are no available VCS providers</h2>
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

function accountDropdown(model: VcsOptionCategoryModel): JSX.Element {
    const accounts = model.vcsAccounts.map(createAccountDropdownItem)
    return (
        <Dropdown items={accounts}
            onValueChange={a => model.setCurrentAccount(a)}
            selectedValue={model.vcsCurrentAccount}
            createPlaceholder={() => model.vcsCurrentAccount?.username ?? "Choose account"} />
    )
}

function createAccountDropdownItem(account: domain.Account): DropdownItem<domain.Account> {
    return { value: account, title: `${account.username} (${account.provider.name})` }
}

function providerList(model: VcsOptionCategoryModel): JSX.Element {
    return (
        <ul>
            {model.vcsProviders.map(provider => (
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
                        <button className={styles.addAccount} onClick={() => model.addAccount(provider)} />
                    </div>
                    {accountList(model, provider)}
                </li>
            ))}
        </ul>
    )
}

function accountList(model: VcsOptionCategoryModel, provider: domain.Provider): JSX.Element {
    return (
        <ul>
            {model.vcsAccounts.filter(account => account.provider === provider).map(account => (
                <li key={account.id} className={styles.account}>
                    <button onClick={() => model.deleteAccount(account)} className={styles.deleteAccount} />
                    <span className={styles.accountName}>{account.username}</span>
                </li>
            ))}
        </ul>
    )
}
