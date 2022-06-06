import React from "react"
import styles from "./SolutionsView.module.scss"
import * as model from "./SolutionsView.model"
import { autorender } from "../autorender"
import { Button } from "../Button"

interface SolutionsViewProps {
    view: model.SolutionsView
}

export function SolutionsViewSidePanelContent({ view }: SolutionsViewProps): JSX.Element {
    return autorender(() => {
        return (
            <div className={styles.sidePanelContent}>
                {view.solutionsExplorer.render()}
                <Button className={styles.closeButton} variant="danger" onClick={() => view.close()}>Close</Button>
            </div>
        )
    }, [view])
}

export function SolutionsViewMainPanelContent(): JSX.Element {
    return <div className={styles.mainPanelContent}>No solution is running</div>
}
