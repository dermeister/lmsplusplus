import React from "react";

import autorender from "../autorender";
import { SignIn } from "../SignIn";
import { AppModel } from "./AppModel";
import styles from "./App.module.css";

interface AppProps {
  model: AppModel;
}

function content(model: AppModel): JSX.Element {
  if (model.auth.user === null) return <SignIn model={model.signIn} />;
  return signedIn();
}

function signedIn(): JSX.Element {
  return <div>Sign out</div>;
}

export function App({ model }: AppProps): JSX.Element {
  return autorender(() => <div className={styles.app}>{content(model)}</div>);
}
