import React from "react";

import styles from "./Button.module.css";

interface ButtonProps {
  onClick?(): void;
  children: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element {
  return <button {...props} className={styles.button} />;
}
