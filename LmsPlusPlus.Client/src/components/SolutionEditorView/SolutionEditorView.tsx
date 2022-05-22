import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import styles from "./SolutionEditor.module.scss"
import { Dropdown } from "../Dropdown"
import { SolutionEditorView } from "./SolutionEditor"

interface SolutionEditorProps {
    model: SolutionEditorView
}

export function SolutionEditorSidePanelContent({ model }: SolutionEditorProps): JSX.Element {
    return autorender(() => {
        return (
            <div className={styles.form}>
                <Field label="Name" className={styles.field}>
                    <Input id="solution-name"
                        className={styles.input}
                        value={model.name}
                        onChange={e => model.setName(e.target.value)} />
                </Field>
                <Field label="Technology" className={styles.field}>
                    <Dropdown items={model.availableTechnologies.map(t => ({ title: t.name, value: t }))}
                        selectedValue={model.selectedTechnology}
                        onValueChange={t => model.setTechnology(t)}
                        createPlaceholder={() => model.selectedTechnology?.name ?? "Select technology"} />
                </Field>
                <div className={styles.buttons}>
                    <Button variant="primary"
                        onClick={() => model.saveSolution()}
                        className={styles.primary}>
                        Save
                    </Button>
                    <Button variant="danger"
                        onClick={() => model.cancelSolutionEditing()}
                        className={styles.danger}>
                        Cancel
                    </Button>
                </div>
            </div>
        )
    })
}

export function SolutionEditorMainPanelContent(_: SolutionEditorProps): JSX.Element {
    return <p className={styles.mainPanelContent}>Create your solution</p>
}

