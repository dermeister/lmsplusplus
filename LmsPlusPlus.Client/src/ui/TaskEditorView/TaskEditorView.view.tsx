import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import { MonacoEditor } from "../MonacoEditor"
import { MultiselectDropdown } from "../MultiselectDropdown"
import * as model from "./TaskEditorView.model"
import styles from "./TaskEditorView.module.scss"

interface TaskEditorViewProps {
    view: model.TaskEditorView
}

export function TaskEditorSidePanelContent({ view }: TaskEditorViewProps): JSX.Element {
    function createTechnologiesDropdownPlaceholder(): string {
        const selectedTechnologies = view.selectedTechnologies.map(t => t.name)
        if (selectedTechnologies.length === 1)
            return "1 technology selected"
        return `${selectedTechnologies.length} technologies selected`
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
        e.preventDefault()
        view.saveTask().catch(() => { })
    }

    return autorender(() => (
        <form className={styles.sidePanelContent} onSubmit={onSubmit}>
            <Field label="Title" className={styles.field}>
                <Input id="task-title"
                    className={styles.input}
                    value={view.taskTitle}
                    onChange={e => view.setTaskTitle(e.target.value)} />
            </Field>
            <Field label="Technologies" className={styles.field}>
                <MultiselectDropdown items={view.availableTechnologies.map(t => ({ title: t.name, value: t }))}
                    selectedValues={view.selectedTechnologies}
                    onValuesChange={values => view.setSelectedTechnologies(values)}
                    createPlaceholder={() => createTechnologiesDropdownPlaceholder()} />
            </Field>
            <div className={styles.buttons}>
                <Button variant="primary" className={styles.primary}>
                    Save
                </Button>
                <Button variant="danger"
                    onClick={() => view.cancelTaskEditing()}
                    className={styles.danger}>
                    Cancel
                </Button>
            </div>
        </form>
    ), [view])
}

export function TaskEditorMainPanelContent({ view }: TaskEditorViewProps): JSX.Element {
    return autorender(() => (
        <div className={styles.mainPanelContent}>
            <MonacoEditor model={view.description} />
        </div>
    ), [view])
}
