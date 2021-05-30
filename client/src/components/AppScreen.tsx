import React from "react";
import { Models } from "../models";
import { Activities } from "./Activities";
import styles from "./AppScreen.module.css";
import autorender from "./autorender";
import { Explorer } from "./Explorer";
import { Side, SidePanel } from "./SidePanel";

interface AppScreenProps {
  model: Models.App;
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  return autorender(() => (
    <>
      <Activities model={model.activities} />

      <div className={styles.content}>
        <SidePanel model={model.leftSidePanel} title="Tasks" side={Side.Left}>
          <Explorer model={model.explorer} />
        </SidePanel>

        <div className={styles.mainPanel}>Main panel</div>
      </div>
    </>
  ));
}
