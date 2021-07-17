import React from "react"
import styles from "./Button.module.scss"

type ReactButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

interface ButtonProps extends ReactButtonProps {
  variant: "primary" | "secondary" | "danger"
}

export function Button(props: ButtonProps): JSX.Element {
  return <button {...reactButtonProps(props)} className={buildClassName(props)} />
}

function reactButtonProps(props: ButtonProps): ReactButtonProps {
  const buttonProps: Record<string, unknown> = { ...props }
  delete buttonProps.variant
  return buttonProps
}

const variants = {
  primary: styles.primary,
  danger: styles.danger,
  secondary: styles.secondary
}

function buildClassName(props: ButtonProps): string {
  let className = styles.button
  className += ` ${variants[props.variant]}`
  if (props.className)
    className += ` ${props.className}`
  return className
}
