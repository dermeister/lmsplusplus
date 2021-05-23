import React from "react";

import autorender from "../autorender";
import { SignInModel } from "./SignInModel";
import styles from "./SignIn.module.css";

interface SignInProps {
  model: SignInModel;
}

export function SignIn({ model }: SignInProps): JSX.Element {
  return autorender(() => <div className={styles.background}>Sign in!</div>);
}
