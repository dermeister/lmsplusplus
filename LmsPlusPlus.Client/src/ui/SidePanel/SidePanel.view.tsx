import React from "react"
import { autorender } from "../autorender"
import { combineClassNames, maybeValue } from "../utils"
import * as model from "./SidePanel.model"
import styles from "./SidePanel.module.scss"

interface SidePanelProps {
    sidePanel: model.SidePanel
    children: React.ReactNode
}

export function SidePanel({ sidePanel, children }: SidePanelProps): JSX.Element {
    return autorender(() => {
        if (!sidePanel.isOpened)
            return <></>
        const combinedHeaderClassName = combineClassNames(styles.header, maybeValue(styles.headerShowingLoader, Boolean(sidePanel.shouldShowLoader)))
        return (
            <div className={styles.sidePanel}>
                <header className={combinedHeaderClassName}>
                    <h2 className={styles.title}>{sidePanel.title}</h2>
                </header>
                <div className={styles.sidePanelContent}>{children}</div>
            </div>
        )
    }, [sidePanel, children])
}
