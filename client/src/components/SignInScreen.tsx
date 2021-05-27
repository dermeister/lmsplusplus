import React from "react";

import autorender from "./autorender";
import { SignInModel } from "../models/SignInModel";
import { Button } from "./Button";
import { Input } from "./Input";
import styles from "./SignInScreen.module.css";

interface SignInScreenProps {
  model: SignInModel;
}

export function SignInScreen({ model }: SignInScreenProps): JSX.Element {
  function onLogin(e: React.ChangeEvent<HTMLInputElement>): void {
    model.setLogin(e.target.value);
  }

  function onPassword(e: React.ChangeEvent<HTMLInputElement>): void {
    model.setPassword(e.target.value);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    model.signIn();
  }

  return autorender(() => {
    return (
      <div className={styles.screen}>
        <h1 className={styles.screenTitle}>LMS++</h1>

        <form className={styles.form} onSubmit={onSubmit}>
          <p className={styles.formHeading}>Welcome back!</p>

          <div>
            <label className={styles.label} htmlFor="sign-in-login">
              Login
            </label>
            <Input
              className={styles.input}
              value={model.login}
              onChange={onLogin}
              id="sign-in-login"
              fluid
            />
          </div>

          <div>
            <label className={styles.label} htmlFor="sign-in-password">
              Password
            </label>
            <Input
              value={model.password}
              onChange={onPassword}
              className={styles.input}
              id="sign-in-password"
              type="password"
              fluid
            />
          </div>

          <Button className={styles.submit} fluid>
            Sign in
          </Button>
        </form>
      </div>
    );
  });
}
