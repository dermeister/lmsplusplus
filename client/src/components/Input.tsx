import React from "react"
import styles from "./Input.module.scss"
import { combineClassNames } from "./utils"

interface InputProps extends React.ComponentProps<"input"> {
  variant: "primary" | "secondary"
}

export function Input(props: InputProps): JSX.Element {
  const className = combineClassNames(styles.input, variants[props.variant], props.className)
  return <input autoComplete="off" {...reactInputProps(props)} className={className} />
}

function reactInputProps(props: InputProps): React.ComponentProps<"input"> {
  const inputProps: Record<string, unknown> = { ...props }
  delete inputProps.variant
  return inputProps
}

const variants = {
  "primary": styles.primary,
  "secondary": styles.secondary
}
