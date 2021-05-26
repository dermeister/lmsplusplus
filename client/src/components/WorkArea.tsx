import React from "react";

import autorender from "./autorender";
import { Side, SidePanel } from "./SidePanel";
import { AppModel } from "../models/AppModel";
import styles from "./WorkArea.module.css";

interface WorkAreaProps {
  model: AppModel;
}

export function WorkArea({ model }: WorkAreaProps): JSX.Element {
  return autorender(() => (
    <div className={styles.workArea}>
      <SidePanel model={model.leftSidePanel} title="Tasks" side={Side.Left}>
        Hello, world!
      </SidePanel>

      <div className={styles.mainPanel}>Main panel</div>
    </div>
  ));
}
