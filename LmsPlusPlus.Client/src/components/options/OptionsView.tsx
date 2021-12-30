import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { OptionCategories } from "./OptionCategories"
import styles from "./OptionsView.module.scss"
import { Preferences } from "./Preferences"
import { Vcs } from "./Vcs"

interface OptionsViewProps {
    model: models.OptionsView
}

export function OptionsViewSidePanelContent({ model }: OptionsViewProps): JSX.Element {
    return autorender(() => (
        <div className={styles.sidePanelContent}>
            <OptionCategories model={model.optionCategoriesExplorer} />
            <Button variant="danger" className={styles.signOut}>
                Sign out
            </Button>
        </div>
    ), [model])
}

export function OptionsViewMainPanelContent({ model }: OptionsViewProps): JSX.Element {
    return autorender(() => {
        let body: JSX.Element = <></>
        switch (model.optionCategoriesExplorer.selectedCategory) {
            case models.OptionCategory.Vsc:
                body = <Vcs model={model.options} />
                break
            case models.OptionCategory.Preferences:
                body = <Preferences model={model.options} />
                break
        }
        return <div className={styles.mainPanelContent}>{body}</div>
    }, [model])
}
