import React from "react"
import styles from "./Field.module.scss"

interface FieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, children, className }: FieldProps): JSX.Element {
  return (
    <div className={className ?? ""}>
      <label>
        <p className={styles.label}>{label}</p>
        {children}
      </label>
    </div>
  )
}
