import React from "react";

import autorender from "../autorender";
import { AppModel } from "./AppModel";
import { Activities } from "../Activities";
import styles from "./App.module.css";
import { WorkArea } from "../WorkArea";

interface AppProps {
  model: AppModel;
}

function content(model: AppModel): JSX.Element {
  return (
    <>
      <Activities model={model.activities} />
      <WorkArea model={model.workArea} />
    </>
  );
}

export function App({ model }: AppProps): JSX.Element {
  return autorender(() => <div className={styles.app}>{content(model)}</div>);
}
