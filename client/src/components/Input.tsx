import React from "react"
import styles from "./Input.module.scss"

type ReactInputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

interface InputProps extends ReactInputProps {
  variant: "primary" | "secondary"
}

export function Input(props: InputProps): JSX.Element {
  return <input autoComplete="off" {...reactInputProps(props)} className={buildClassName(props)} />
}

function reactInputProps(props: InputProps): ReactInputProps {
  const inputProps: Record<string, unknown> = { ...props }
  delete inputProps.variant
  return inputProps
}

const variants = {
  "primary": styles.primary,
  "secondary": styles.secondary
}

function buildClassName(props: InputProps): string {
  let className = styles.input
  className += ` ${variants[props.variant]}`
  if (props.className)
    className += ` ${props.className}`
  return className
}
