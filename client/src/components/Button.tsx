import React from "react";
import styles from "./Button.module.css";

type ReactButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

interface ButtonProps extends ReactButtonProps {
  fluid?: boolean;
}

function buildClassName(props: ButtonProps): string {
  let className = styles.button;
  if (props.className !== undefined) className += ` ${props.className}`;
  if (props.fluid) className += ` ${styles.fluid}`;

  return className;
}

function reactButtonProps(props: ButtonProps): ReactButtonProps {
  const buttonProps = { ...props };
  delete buttonProps.fluid;
  return buttonProps;
}

export function Button(props: ButtonProps): JSX.Element {
  return <button {...reactButtonProps(props)} className={buildClassName(props)} />;
}
