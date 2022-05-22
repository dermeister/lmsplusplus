import React from "react"
import { VcsAccountRegisteringModal } from "../../database/VcsAccountRegisteringModal"
import * as domain from "../../domain"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Dropdown, DropdownItem } from "../Dropdown"
import { Field } from "../Field"
import { IOptionsService } from "../IOptionsService"
import styles from "./Vcs.module.scss"
import { VcsOptionCategory } from "./VcsOptionCategory"

interface VcsOptionCategoryViewProps {
    model: VcsOptionCategory
}

export function VcsOptionCategoryView({ model }: VcsOptionCategoryViewProps): JSX.Element {
    return autorender(() => {
        if (model.optionsService.vcsProviders.length === 0)
            return <h2 className={styles.noVcsProviders}>There are no available VCS providers</h2>
        else
            return (
                <div>
                    <Field label="Current account" className={styles.currentAccountField}>
                        {accountDropdown(model.optionsService)}
                    </Field>
                    {providerList(model.optionsService)}
                </div>
            )
    }, [model])
}

function accountDropdown(optionsService: IOptionsService): JSX.Element {
    const accounts = optionsService.vcsAccounts.map(createAccountDropdownItem)
    return (
        <Dropdown items={accounts}
            onValueChange={a => optionsService.setCurrentAccount(a)}
            selectedValue={optionsService.vcsCurrentAccount}
            createPlaceholder={() => optionsService.vcsCurrentAccount?.username ?? "Choose account"} />
    )
}

function createAccountDropdownItem(account: domain.Account): DropdownItem<domain.Account> {
    return { value: account, title: `${account.username} (${account.provider.name})` }
}

function providerList(optioinsService: IOptionsService): JSX.Element {
    return (
        <ul>
            {optioinsService.vcsProviders.map(provider => (
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
                        <button className={styles.addAccount} onClick={() => optioinsService.addAccount(provider)} />
                    </div>
                    {accountList(optioinsService, provider)}
                </li>
            ))}
        </ul>
    )
}

function accountList(optionsService: IOptionsService, provider: domain.Provider): JSX.Element {
    return (
        <ul>
            {optionsService.vcsAccounts.filter(account => account.provider === provider).map(account => (
                <li key={account.id} className={styles.account}>
                    <button onClick={() => optionsService.deleteAccount(account)} className={styles.deleteAccount} />
                    <span className={styles.accountName}>{account.username}</span>
                </li>
            ))}
        </ul>
    )
}
