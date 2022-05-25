import React from "react"
import { autorender } from "../autorender"
import { combineClassNames, maybeValue } from "../utils"
import styles from "./SidePanel.module.scss"

interface SidePanelProps {
    isOpened: boolean
    title: string
    shouldShowLoader: boolean
    children: React.ReactNode
}

export function SidePanel({ isOpened, shouldShowLoader, title, children }: SidePanelProps): JSX.Element {
    return autorender(() => {
        if (!isOpened)
            return <></>
        const combinedHeaderClassName = combineClassNames(styles.header, maybeValue(styles.headerShowingLoader, Boolean(shouldShowLoader)))
        return (
            <div className={styles.sidePanel}>
                <header className={combinedHeaderClassName}>
                    <h2 className={styles.title}>{title}</h2>
                </header>
                <div className={styles.children}>{children}</div>
            </div>
        )
    }, [isOpened, shouldShowLoader, title, children])
}
