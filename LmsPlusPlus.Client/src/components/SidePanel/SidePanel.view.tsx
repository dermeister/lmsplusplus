import React from "react"
import { autorender } from "../autorender"
import styles from "./SidePanel.module.scss"
import { combineClassNames, maybeValue } from "../utils"
import { SidePanelModel } from "./SidePanel.model"

interface SidePanelProps {
    model: SidePanelModel
    children: React.ReactNode
}

export function SidePanel({ model, children }: SidePanelProps): JSX.Element {
    return autorender(() => {
        if (!model.isOpened)
            return <></>
        const combinedHeaderClassName = combineClassNames(styles.header, maybeValue(styles.headerShowingLoader, Boolean(model.shouldShowLoader)))
        return (
            <div className={styles.sidePanel}>
                <header className={combinedHeaderClassName}>
                    <h2 className={styles.title}>{model.title}</h2>
                </header>
                <div className={styles.children}>{children}</div>
            </div>
        )
    }, [model, children])
}
