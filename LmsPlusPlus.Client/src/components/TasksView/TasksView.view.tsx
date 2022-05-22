import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
// import { TaskEditorMainPanelContent, TaskEditorSidePanelContent } from "./TaskEditor"
import { TasksExplorer } from "../TasksExplorer"
import { TasksViewModel } from "./TasksView.model"
import styles from "./TasksView.module.scss"
// import { SolutionEditorMainPanelContent, SolutionEditorSidePanelContent } from "./SolutionEditor"
// import { SolutionRunnerMainPanelContent, SolutionRunnerSidePanelContent } from "./SolutionRunner"

interface TasksViewProps {
    model: TasksViewModel
}

export function TasksViewSidePanelContent({ model }: TasksViewProps): JSX.Element {
    return autorender(() => {
        // if (model.taskEditor)
        //     return <TaskEditorSidePanelContent model={model} />
        // if (model.solutionEditor)
        //     return <SolutionEditorSidePanelContent model={model} />
        // if (model.solutionRunner)
        //     return <SolutionRunnerSidePanelContent model={model} />
        return model.tasksExplorer.render()
    }, [model])
}

export function TasksViewMainPanelContent({ model }: TasksViewProps): JSX.Element {
    return autorender(() => {
        // if (model.taskEditor)
        //     return <TaskEditorMainPanelContent model={model} />
        // if (model.solutionEditor)
        //     return <SolutionEditorMainPanelContent model={model} />
        // if (model.solutionRunner)
        //     return <SolutionRunnerMainPanelContent model={model} />
        return taskDescription(model)
    }, [model])
}

function taskDescription(model: TasksViewModel): JSX.Element {
    if (!model.taskDescriptionHtml)
        return <p className={styles.noTask}>No task selected</p>
    return <div className={styles.description} dangerouslySetInnerHTML={{ __html: model.taskDescriptionHtml }} />
}