import React from "react"
import { IAuthService } from "../AuthService"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { OptionsViewModel } from "./OptionsView.model"
import styles from "./OptionsView.module.scss"

interface SidePanelContentProps {
    model: OptionsViewModel
    authService: IAuthService
}

export function SidePanelContent({ model, authService }: SidePanelContentProps): JSX.Element {
    return autorender(() => (
        <div className={styles.sidePanelContent}>
            {model.categoriesExplorer.render()}
            <Button variant="danger" className={styles.signOut} onClick={() => authService.signOut()}>Sign out</Button>
        </div>
    ), [model, authService])
}

interface MainContentProps {
    model: OptionsViewModel
}

export function MainContent({ model }: MainContentProps): JSX.Element {
    return autorender(() => <div className={styles.mainPanelContent}>{model.currentOptionCategory.render()}</div>)
}
