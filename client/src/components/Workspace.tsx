import React from "react";

import autorender from "./autorender";
import { Side, SidePanel } from "./SidePanel";
import { AppModel } from "../models/AppModel";
import styles from "./Workspace.module.css";

interface WorkspaceProps {
  model: AppModel;
}

export function Workspace({ model }: WorkspaceProps): JSX.Element {
  return autorender(() => (
    <div className={styles.workspace}>
      <SidePanel model={model.leftSidePanel} title="Tasks" side={Side.Left}>
        Hello, world!
      </SidePanel>

      <div className={styles.mainPanel}>Main panel</div>
    </div>
  ));
}
