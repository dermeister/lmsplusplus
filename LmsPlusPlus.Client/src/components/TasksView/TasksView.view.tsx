import React from "react"
import { autorender } from "../autorender"
import { TasksViewModel } from "./TasksView.model"
import styles from "./TasksView.module.scss"

interface TasksViewSidePanelProps {
    model: TasksViewModel
}

export function TasksViewSidePanelContent({ model }: TasksViewSidePanelProps): JSX.Element {
    return autorender(() => model.tasksExplorer.render(), [model])
}

interface TasksViewMainPanelProps {
    model: TasksViewModel
}

export function TasksViewMainPanelContent({ model }: TasksViewMainPanelProps): JSX.Element {
    return autorender(() => {
        if (!model.taskDescriptionHtml)
            return <p className={styles.noTask}>No task selected</p>
        return <div className={styles.description} dangerouslySetInnerHTML={{ __html: model.taskDescriptionHtml }} />
    }, [model])
}
