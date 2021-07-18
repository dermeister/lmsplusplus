import React from "react"
import { SignIn } from "../models/SignIn"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { Input } from "./Input"
import styles from "./SignInScreen.module.scss"

interface SignInScreenProps {
  model: SignIn
}

export function SignInScreen({ model }: SignInScreenProps): JSX.Element {
  function onLogin(e: React.ChangeEvent<HTMLInputElement>): void {
    model.setLogin(e.target.value)
  }

  function onPassword(e: React.ChangeEvent<HTMLInputElement>): void {
    model.setPassword(e.target.value)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    model.signIn()
  }

  return autorender(() => (
    <div className={styles.screen}>
      <h1 className={styles.screenTitle}>LMS++</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        <p className={styles.formHeading}>Welcome back!</p>

        <div>
          <label className={styles.label} htmlFor="sign-in-login">Login</label>
          <Input
            id="sign-in-login"
            variant="primary"
            value={model.login}
            onChange={onLogin}
            className={styles.input}
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="sign-in-password">Password</label>
          <Input
            id="sign-in-password"
            variant="primary"
            value={model.password}
            onChange={onPassword}
            type="password"
            className={styles.input}
          />
        </div>

        <Button className={styles.submit} variant="primary">Sign in</Button>
      </form>
    </div>
  ), [model])
}
