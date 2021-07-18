import React from "react"
import { Models } from "../../models"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Input } from "../Input"
import styles from "./TaskEditor.module.scss"

interface TaskEditorProps {
  model: Models.TaskEditor
}

export function TaskEditor({ model }: TaskEditorProps): JSX.Element {
  return autorender(() => (
    <div className={styles.container}>
      <div>
        <label className={styles.label} htmlFor="task-title">Title</label>
        <Input
          id="task-title"
          variant="secondary"
          className={styles.input}
          value={model.title}
          onChange={e => model.setTitle(e.target.value)}
        />
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
    </div >
  ), [model])
}
