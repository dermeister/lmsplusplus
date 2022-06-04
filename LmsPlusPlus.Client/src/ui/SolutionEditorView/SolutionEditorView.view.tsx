import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"
import { Input } from "../Input"
import * as model from "./SolutionEditorView.model"
import styles from "./SolutionEditorView.module.scss"

interface SolutionEditorViewProps {
    view: model.SolutionEditorView
}

export function SolutionEditorSidePanelContent({ view }: SolutionEditorViewProps): JSX.Element {
    return autorender(() => {
        return (
            <div className={styles.sidePanelContent}>
                <Field label="Repository Name" className={styles.field}>
                    <Input id="solution-name"
                        className={styles.input}
                        value={view.repositoryName}
                        onChange={e => view.setRepositoryName(e.target.value)} />
                </Field>
                <Field label="Technology" className={styles.field}>
                    <Dropdown items={view.availableTechnologies.map(t => ({ title: t.name, value: t }))}
                        selectedValue={view.selectedTechnology}
                        onValueChange={t => view.setTechnology(t)}
                        createPlaceholder={() => view.selectedTechnology?.name ?? "Select technology"} />
                </Field>
                <div className={styles.buttons}>
                    <Button variant="primary"
                        onClick={() => view.saveSolution().catch(() => { })}
                        className={styles.primary}>
                        Save
                    </Button>
                    <Button variant="danger"
                        onClick={() => view.cancelSolutionEditing()}
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
