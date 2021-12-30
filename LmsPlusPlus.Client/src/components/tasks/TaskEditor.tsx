import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import { MonacoEditor } from "../MonacoEditor"
import styles from "./TaskEditor.module.scss"

interface TaskEditorProps {
    model: models.TasksView
}

export function TaskEditorSidePanelContent({ model }: TaskEditorProps): JSX.Element {
    return autorender(() => {
        const taskEditor = getTaskEditor(model)
        return (
            <div className={styles.sidePanelContent}>
                <Field label="Title" className={styles.taskTitle}>
                    <Input id="task-title"
                           className={styles.input}
                           value={taskEditor.title}
                           onChange={e => taskEditor.setTitle(e.target.value)} />
                </Field>
                <div className={styles.buttons}>
                    <Button variant="primary"
                            onClick={() => model.saveEditedTask()}
                            className={styles.primary}>
                        Save
                    </Button>
                    <Button variant="danger"
                            onClick={() => model.cancelTaskEditing()}
                            className={styles.danger}>
                        Cancel
                    </Button>
                </div>
            </div>
        )
    }, [model])
}

export function TaskEditorMainPanelContent({ model }: TaskEditorProps): JSX.Element {
    return autorender(() => {
        const taskEditor = getTaskEditor(model)
        return (
            <div className={styles.mainPanelContent}>
                <MonacoEditor model={taskEditor.description} />
            </div>
        )
    }, [model])
}

function getTaskEditor(model: models.TasksView): models.TaskEditor {
    const { taskEditor } = model
    if (!taskEditor)
        throw new Error()
    return taskEditor
}
