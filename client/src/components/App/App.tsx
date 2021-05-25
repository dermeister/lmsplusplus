import React from "react";

import autorender from "../autorender";
import { AppModel } from "./AppModel";
import { ActivityBar } from "../ActivityBar";
import styles from "./App.module.css";

interface AppProps {
  model: AppModel;
}

function content(model: AppModel): JSX.Element {
  return (
    <>
      <ActivityBar model={model.activityBar} />
    </>
  );
}

export function App({ model }: AppProps): JSX.Element {
  return autorender(() => <div className={styles.app}>{content(model)}</div>);
}
