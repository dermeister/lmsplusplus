import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import styles from "./SolutionEditor.module.scss"
import { Dropdown } from "../Dropdown"

interface SolutionEditorProps {
    model: models.TasksView
}

export function SolutionEditorSidePanelContent({ model }: SolutionEditorProps): JSX.Element {
    return autorender(() => {
        const solutionEditor = getSolutionEditor(model)
        return (
            <div className={styles.form}>
                <Field label="Name" className={styles.field}>
                    <Input id="solution-name"
                           className={styles.input}
                           value={solutionEditor.name}
                           onChange={e => solutionEditor.setName(e.target.value)} />
                </Field>
                <Field label="Technology" className={styles.field}>
                    <Dropdown items={solutionEditor.availableTechnologies.map(t => ({ title: t.name, value: t }))}
                              selectedValue={solutionEditor.selectedTechnology}
                              onValueChange={t => solutionEditor.setTechnology(t)}
                              createPlaceholder={() => solutionEditor.selectedTechnology?.name ?? "Select technology"} />
                </Field>
                <div className={styles.buttons}>
                    <Button variant="primary"
                            onClick={() => model.saveEditedSolution()}
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

function getSolutionEditor(model: models.TasksView): models.SolutionEditor {
    const { solutionEditor } = model
    if (!solutionEditor)
        throw new Error("Solution editor is not created")
    return solutionEditor
}
