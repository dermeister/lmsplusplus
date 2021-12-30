import React from "react"
import * as models from "../models"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { Field } from "./Field"
import { Input } from "./Input"
import styles from "./SignInScreen.module.scss"

interface SignInScreenProps {
    model: models.SignInScreen
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
        // model.signIn()
    }

    return autorender(() => (
        <div className={styles.screen}>
            <h1 className={styles.screenTitle}>LMS++</h1>
            <form className={styles.form} onSubmit={onSubmit}>
                <p className={styles.formHeading}>Welcome back!</p>
                <Field label="Login">
                    <Input id="sign-in-login"
                           value={model.login}
                           onChange={onLogin}
                           className={styles.input} />
                </Field>
                <Field label="Password">
                    <Input id="sign-in-password"
                           value={model.password}
                           onChange={onPassword}
                           type="password"
                           className={styles.input} />
                </Field>
                <Button className={styles.submit} variant="primary">Sign in</Button>
            </form>
        </div>
    ), [model])
}
