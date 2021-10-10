import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import { SidePanel } from "../SidePanel"
import styles from "./SollutionEditorView.module.scss"

interface TaskEditorViewProps {
  model: models.SolutionEditorView
}

export function SolutionEditorView({model}: TaskEditorViewProps): JSX.Element {
  return autorender(() => (
    <div className={styles.solutionEditor}>
      <div className={styles.sidePanel}>
        <SidePanel model={model.sidePanel} pulsing={model.monitor.isActive}>
          {form(model)}
        </SidePanel>
      </div>
      <div className={styles.content}>
        Create your solution
      </div>
    </div>
  ), [model])
}

function form(model: models.SolutionEditorView): JSX.Element {
  return (
    <div className={styles.form}>
      <Field label="Name" className={styles.solutionName}>
        <Input
          id="solution-name"
          className={styles.input}
          value={model.name}
          onChange={e => model.setSolutionName(e.target.value)}
        />
      </Field>
      <div className={styles.buttons}>
        <Button
          variant="primary"
          onClick={() => model.save()}
          className={styles.primary}
        >
          Save
        </Button>

        <Button
          variant="danger"
          onClick={() => model.cancel()}
          className={styles.danger}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
