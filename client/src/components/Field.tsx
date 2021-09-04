import React from "react"
import styles from "./Field.module.scss"
import { combineClassNames } from "./utils"

interface FieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, children, className }: FieldProps): JSX.Element {
  return (
    <label className={combineClassNames(styles.container, className)}>
      <p className={styles.labelText}>{label}</p>
      {children}
    </label>
  )
}
