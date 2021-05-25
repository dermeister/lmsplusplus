import React from "react";

import styles from "./SidePanel.module.css";

export enum Position {
  Left,
  Right,
}

interface SideBarProps {
  position: Position;
  children?: React.ReactNode;
}

export function SidePanel({ children }: SideBarProps): JSX.Element {
  return <div className={styles.sidePanel}>{children}</div>;
}
