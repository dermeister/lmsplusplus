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
    <div className={styles.viewContent}>
      <SidePanel model={model.sidePanel} pulsing={model.monitor.isActive}>
        {fields(model)}
      </SidePanel>
      <div className={styles.mainPanel}>
        <MonacoEditor model={model.taskDescription} />
      </div>
    </div>
  ), [model])
}

function fields(model: models.TaskEditorView): JSX.Element {
  return (
    <div className={styles.container}>
      <div>
        <Field label="Title">
          <Input
            id="task-title"
            variant="secondary"
            className={styles.input}
            value={model.taskTitle}
            onChange={e => model.setTaskTitle(e.target.value)}
          />
        </Field>
      </div>
      <div className={styles.buttons}>
        <Button
          variant="primary"
          onClick={() => model.save()}
          className={`${styles.button} ${styles.primary}`}
        >
          Save
        </Button>

        <Button
          variant="danger"
          onClick={() => model.cancel()}
          className={`${styles.button} ${styles.danger}`}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
