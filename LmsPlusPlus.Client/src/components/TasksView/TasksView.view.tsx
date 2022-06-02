import React from "react"
import { autorender } from "../autorender"
import * as model from "./TasksView.model"
import styles from "./TasksView.module.scss"

interface TasksViewProps {
    view: model.TasksView
}

export function TasksViewSidePanelContent({ view }: TasksViewProps): JSX.Element {
    return autorender(() => (
        <div className={styles.sidePanelContent}>{view.tasksExplorer.render()}</div>
    ), [view])
}

export function TasksViewMainPanelContent({ view }: TasksViewProps): JSX.Element {
    return autorender(() => {
        let content: JSX.Element
        if (!view.taskDescriptionHtml)
            content = <p className={styles.noTaskSelected}>No task selected</p>
        else
            content = <div className={styles.taskDescription} dangerouslySetInnerHTML={{ __html: view.taskDescriptionHtml }} />
        return <div className={styles.mainPanelContent}>{content}</div>
    }, [view])
}
