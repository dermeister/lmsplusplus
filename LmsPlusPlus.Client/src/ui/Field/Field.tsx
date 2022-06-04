import React from "react"
import { combineClassNames } from "../utils"
import styles from "./Field.module.scss"

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
