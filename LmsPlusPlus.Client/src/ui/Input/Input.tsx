import React from "react"
import { combineClassNames } from "../utils"
import styles from "./Input.module.scss"

export function Input(props: React.ComponentProps<"input">): JSX.Element {
    const className = combineClassNames(styles.input, props.className)
    return <input autoComplete="off" {...reactInputProps(props)} className={className} />
}

function reactInputProps(props: React.ComponentProps<"input">): React.ComponentProps<"input"> {
    const inputProps: Record<string, unknown> = { ...props }
    delete inputProps.variant
    return inputProps
}
