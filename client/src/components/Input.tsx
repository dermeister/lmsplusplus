import React from "react";

import styles from "./Input.module.css";

type ReactInputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

interface InputProps extends ReactInputProps {
  fluid?: boolean;
}

function buildClassName(props: InputProps): string {
  let className = styles.input;
  if (props.className !== undefined) className += ` ${props.className}`;
  if (props.fluid) className += ` ${styles.fluid}`;

  return className;
}

function reactInputProps(props: InputProps): ReactInputProps {
  const inputProps = { ...props };
  delete inputProps.fluid;
  return inputProps;
}

export function Input(props: InputProps): JSX.Element {
  return <input autoComplete="off" {...reactInputProps(props)} className={buildClassName(props)} />;
}
