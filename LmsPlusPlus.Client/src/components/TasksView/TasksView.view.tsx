import React from "react"
import { autorender } from "../autorender"
import { TasksExplorer } from "../TasksExplorer"
import styles from "./TasksView.module.scss"

interface TasksViewSidePanelProps {
    explorer: TasksExplorer
}

export function TasksViewSidePanelContent({ explorer }: TasksViewSidePanelProps): JSX.Element {
    return autorender(() => explorer.render(), [explorer])
}

interface TasksViewMainPanelProps {
    taskDescriptionHtml: string | null
}

export function TasksViewMainPanelContent({ taskDescriptionHtml }: TasksViewMainPanelProps): JSX.Element {
    return autorender(() => {
        if (!taskDescriptionHtml)
            return <p className={styles.noTask}>No task selected</p>
        return <div className={styles.description} dangerouslySetInnerHTML={{ __html: taskDescriptionHtml }} />
    }, [taskDescriptionHtml])
}
