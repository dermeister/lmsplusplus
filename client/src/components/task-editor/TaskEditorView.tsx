import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import { MonacoEditor } from "../MonacoEditor"
import { SidePanel } from "../SidePanel"
import styles from "./TaskEditorView.module.scss"

interface TaskEditorViewProps {
  model: models.TaskEditorView
}

export function TaskEditorView({ model }: TaskEditorViewProps): JSX.Element {
  return autorender(() => (
    <section className={styles.taskEditor}>
      <div className={styles.sidePanel}>
        <SidePanel model={model.sidePanel} pulsing={model.monitor.isActive}>
          {form(model)}
        </SidePanel>
      </div>
      <div className={styles.content}>
        <MonacoEditor model={model.taskDescription} />
      </div>
    </section>
  ), [model])
}

function form(model: models.TaskEditorView): JSX.Element {
  return (
    <div className={styles.form}>
      <Field label="Title" className={styles.taskTitle}>
        <Input
          id="task-title"
          className={styles.input}
          value={model.taskTitle}
          onChange={e => model.setTaskTitle(e.target.value)}
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
