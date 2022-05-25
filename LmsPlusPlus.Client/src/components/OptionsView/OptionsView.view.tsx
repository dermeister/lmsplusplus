import React from "react"
import { IAuthService } from "../AuthService"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { OptionCategoriesExplorer } from "../OptionCategoriesExplorer"
import { OptionCategory } from "../OptionCategory"
import styles from "./OptionsView.module.scss"

interface SidePanelContentProps {
    categoriesExplorer: OptionCategoriesExplorer
    authService: IAuthService
}

export function SidePanelContent({ categoriesExplorer, authService }: SidePanelContentProps): JSX.Element {
    return autorender(() => (
        <div className={styles.sidePanelContent}>
            {categoriesExplorer.render()}
            <Button variant="danger" className={styles.signOut} onClick={() => authService.signOut()}>Sign out</Button>
        </div>
    ), [categoriesExplorer, authService])
}

interface MainContentProps {
    currentOptionCategory: OptionCategory
}

export function MainPanelContent({ currentOptionCategory }: MainContentProps): JSX.Element {
    return autorender(() => <div className={styles.mainPanelContent}>{currentOptionCategory.render()}</div>, [currentOptionCategory])
}
