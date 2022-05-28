import { editor } from "monaco-editor"
import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import { MonacoEditor } from "../MonacoEditor"
import { MultiselectDropdown } from "../MultiselectDropdown"
import * as model from "./TaskEditorView.model"
import styles from "./TaskEditorView.module.scss"

interface TaskEditorSidePanelContentProps {
    taskEditorView: model.TaskEditorView
}

export function TaskEditorSidePanelContent({ taskEditorView }: TaskEditorSidePanelContentProps): JSX.Element {
    function createTechnologiesDropdownPlaceholder(): string {
        const selectedTechnologies = taskEditorView.selectedTechnologies.map(t => t.name)
        if (selectedTechnologies.length === 1)
            return "1 technology selected"
        return `${selectedTechnologies.length} technologies selected`
    }

    return autorender(() => (
        <div className={styles.sidePanelContent}>
            <Field label="Title" className={styles.field}>
                <Input id="task-title"
                    className={styles.input}
                    value={taskEditorView.taskTitle}
                    onChange={e => taskEditorView.setTaskTitle(e.target.value)} />
            </Field>
            <Field label="Technologies" className={styles.field}>
                <MultiselectDropdown items={taskEditorView.availableTechnologies.map(t => ({ title: t.name, value: t }))}
                    selectedValues={taskEditorView.selectedTechnologies}
                    onValuesChange={values => taskEditorView.setSelectedTechnologies(values)}
                    createPlaceholder={() => createTechnologiesDropdownPlaceholder()} />
            </Field>
            <div className={styles.buttons}>
                <Button variant="primary"
                    onClick={() => taskEditorView.saveTask().catch(() => { })}
                    className={styles.primary}>
                    Save
                </Button>
                <Button variant="danger"
                    onClick={() => taskEditorView.cancelTaskEditing()}
                    className={styles.danger}>
                    Cancel
                </Button>
            </div>
        </div>
    ), [taskEditorView])
}

interface TaskEditorMainPanelContentProps {
    description: editor.ITextModel
}

export function TaskEditorMainPanelContent({ description }: TaskEditorMainPanelContentProps): JSX.Element {
    return autorender(() => (
        <div className={styles.mainPanelContent}>
            <MonacoEditor model={description} />
        </div>
    ), [description])
}
