import React from "react"
import { combineClassNames } from "../utils"
import styles from "./Spinner.module.scss"

interface SpinnerProps {
    className?: string
}

export function Spinner({ className }: SpinnerProps): JSX.Element {
    const combinedClassName = combineClassNames(styles.spinner, className)
    return (
        <svg className={combinedClassName} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <circle cx="50" cy="50" fill="none" stroke="#e15b64" strokeWidth="8" r="35" strokeDasharray="164.93361431346415 56.97787143782138">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50"
                    keyTimes="0;1" />
            </circle>
        </svg>
    )
}
