import React from "react";
import { RootModel } from "../models/RootModel";
import { AppScreen } from "./AppScreen";
import autorender from "./autorender";
import styles from "./Root.module.css";
import { SignInScreen } from "./SignInScreen";
import { WindowManager } from "./WindowManager";

interface RootProps {
  model: RootModel;
}

function content(model: RootModel): JSX.Element {
  if (model.auth.user === null) return <AppScreen model={model.app} />;

  return <SignInScreen model={model.signIn} />;
}

export function Root({ model }: RootProps): JSX.Element {
  return autorender(() => (
    <WindowManager model={model.windowManager}>
      <div className={styles.root}>{content(model)}</div>
    </WindowManager>
  ));
}
