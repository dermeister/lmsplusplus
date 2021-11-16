import React from "react"
import styles from "./Button.module.scss"
import { combineClassNames } from "./utils"

interface ButtonProps extends React.ComponentProps<"button"> {
  variant: "primary" | "secondary" | "danger"
}

export function Button(props: ButtonProps): JSX.Element {
  const className = combineClassNames(styles.button, variants[props.variant], props.className)
  return <button {...reactButtonProps(props)} className={className} />
}

function reactButtonProps(props: ButtonProps): React.ComponentProps<"button"> {
  const buttonProps: Record<string, unknown> = { ...props }
  delete buttonProps.variant
  return buttonProps
}

const variants = {
  primary: styles.primary,
  danger: styles.danger,
  secondary: styles.secondary
}
