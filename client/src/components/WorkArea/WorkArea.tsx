import React from "react";

import autorender from "../autorender";
import { Position, SidePanel } from "../SidePanel";
import styles from "./WorkArea.module.css";

export function WorkArea(): JSX.Element {
  return autorender(() => (
    <div className={styles.workArea}>
      <SidePanel position={Position.Left}>Hello</SidePanel>

      <div className={styles.mainPanel}>Main panel</div>

      <SidePanel position={Position.Right}>World</SidePanel>
    </div>
  ));
}
