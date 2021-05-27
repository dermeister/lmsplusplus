import React from "react";

import autorender from "./autorender";
import { AppModel } from "../models/AppModel";
import { Activities } from "./Activities";
import { SidePanel, Side } from "./SidePanel";
import styles from "./AppScreen.module.css";

interface AppScreenProps {
  model: AppModel;
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  return autorender(() => (
    <>
      <Activities model={model.activities} />

      <div className={styles.content}>
        <SidePanel model={model.leftSidePanel} title="Tasks" side={Side.Left}>
          <div>Task 1</div>
          <div>Task 2</div>
        </SidePanel>

        <div className={styles.mainPanel}>Main panel</div>
      </div>
    </>
  ));
}
