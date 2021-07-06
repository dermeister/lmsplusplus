import React from "react"
import styles from "./Input.module.css"

type ReactInputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

interface InputProps extends ReactInputProps {
  fluid?: boolean
}

export function Input(props: InputProps): JSX.Element {
  return <input autoComplete="off" {...reactInputProps(props)} className={buildClassName(props)} />
}

function reactInputProps(props: InputProps): ReactInputProps {
  const inputProps = { ...props }
  delete inputProps.fluid
  return inputProps
}

function buildClassName(props: InputProps): string {
  let className = styles.input
  if (props.className !== undefined) className += ` ${props.className}`
  if (props.fluid) className += ` ${styles.fluid}`

  return className
}
