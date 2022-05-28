import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"
import { Input } from "../Input"
import * as model from "./SolutionEditorView.model"
import styles from "./SolutionEditorView.module.scss"

interface SolutionEditorSidePanelContentProps {
    solutionEditorView: model.SolutionEditorView
}

export function SolutionEditorSidePanelContent({ solutionEditorView }: SolutionEditorSidePanelContentProps): JSX.Element {
    return autorender(() => {
        return (
            <div className={styles.form}>
                <Field label="Name" className={styles.field}>
                    <Input id="solution-name"
                        className={styles.input}
                        value={solutionEditorView.name}
                        onChange={e => solutionEditorView.setName(e.target.value)} />
                </Field>
                <Field label="Technology" className={styles.field}>
                    <Dropdown items={solutionEditorView.availableTechnologies.map(t => ({ title: t.name, value: t }))}
                        selectedValue={solutionEditorView.selectedTechnology}
                        onValueChange={t => solutionEditorView.setTechnology(t)}
                        createPlaceholder={() => solutionEditorView.selectedTechnology?.name ?? "Select technology"} />
                </Field>
                <div className={styles.buttons}>
                    <Button variant="primary"
                        onClick={() => solutionEditorView.saveSolution().catch(() => { })}
                        className={styles.primary}>
                        Save
                    </Button>
                    <Button variant="danger"
                        onClick={() => solutionEditorView.cancelSolutionEditing()}
                        className={styles.danger}>
                        Cancel
                    </Button>
                </div>
            </div>
        )
    })
}

export function SolutionEditorMainPanelContent(): JSX.Element {
    return <p className={styles.mainPanelContent}>Create your solution</p>
}

