import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import * as model from "./OptionsView.model"
import styles from "./OptionsView.module.scss"

interface OptionsViewProps {
    view: model.OptionsView
}

export function SidePanelContent({ view }: OptionsViewProps): JSX.Element {
    return autorender(() => (
        <div className={styles.sidePanelContent}>
            {view.categoriesExplorer.render()}
            <Button variant="danger" className={styles.signOut} onClick={() => view.authService.signOut()}>
                Sign out
            </Button>
        </div>
    ), [view])
}

export function MainPanelContent({ view }: OptionsViewProps): JSX.Element {
    return autorender(() => <div className={styles.mainPanelContent}>{view.currentOptionCategory.render()}</div>, [view])
}
