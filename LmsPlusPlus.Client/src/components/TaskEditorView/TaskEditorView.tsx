import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import { MonacoEditor } from "../MonacoEditor"
import styles from "./TaskEditor.module.scss"
import { MultiselectDropdown } from "../MultiselectDropdown"
import { TaskEditorView } from "./TaskEditor"

interface TaskEditorProps {
    model: TaskEditorView
}

export function TaskEditorSidePanelContent({ model }: TaskEditorProps): JSX.Element {
    return autorender(() => {
        return (
            <div className={styles.sidePanelContent}>
                <Field label="Title" className={styles.field}>
                    <Input id="task-title"
                        className={styles.input}
                        value={model.title}
                        onChange={e => model.setTitle(e.target.value)} />
                </Field>
                <Field label="Technologies" className={styles.field}>
                    <MultiselectDropdown items={model.availableTechnologies.map(t => ({ title: t.name, value: t }))}
                        selectedValues={model.selectedTechnologies}
                        onValuesChange={values => model.setSelectedTechnologies(values)}
                        createPlaceholder={() => createTechnologiesDropdownPlaceholder(model.selectedTechnologies.map(t => t.name))} />
                </Field>
                <div className={styles.buttons}>
                    <Button variant="primary"
                        onClick={() => model.saveTask()}
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

function createTechnologiesDropdownPlaceholder(selectedTechnologies: readonly string[]): string {
    if (selectedTechnologies.length === 1)
        return "1 technology selected"
    return `${selectedTechnologies.length} technologies selected`
}

export function TaskEditorMainPanelContent({ model }: TaskEditorProps): JSX.Element {
    return autorender(() => {
        return (
            <div className={styles.mainPanelContent}>
                <MonacoEditor model={model.description} />
            </div>
        )
    }, [model])
}
