import React from "react"
import styles from "./Field.module.scss"

interface FieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, children, className }: FieldProps): JSX.Element {
  return (
    <div className={buildClassName(className)}>
      <label>
        <p className={styles.label}>{label}</p>
        {children}
      </label>
    </div>
  )
}

function buildClassName(className?: string): string {
  let result = ""
  if (className)
    result += ` ${className}`
  return result
}
