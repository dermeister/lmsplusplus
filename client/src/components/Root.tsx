import React from "react";

import autorender from "./autorender";
import { RootModel } from "../models/RootModel";
import { AppScreen } from "./AppScreen";
import styles from "./Root.module.css";
import { SignInScreen } from "./SignInScreen";

interface RootProps {
  model: RootModel;
}

function content(model: RootModel): JSX.Element {
  if (model.auth.user === null) return <AppScreen model={model.app} />;
  return <SignInScreen model={model.signIn} />;
}

export function Root({ model }: RootProps): JSX.Element {
  return autorender(() => <div className={styles.root}>{content(model)}</div>);
}
