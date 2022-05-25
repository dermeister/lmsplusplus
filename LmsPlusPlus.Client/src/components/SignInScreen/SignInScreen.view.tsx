import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Field } from "../Field"
import { Input } from "../Input"
import * as model from "./SignInScreen.model"
import styles from "./SignInScreen.module.scss"

interface SignInScreenProps {
    screen: model.SignInScreen
}

export function SignInScreen({ screen }: SignInScreenProps): JSX.Element {
    function onLogin(e: React.ChangeEvent<HTMLInputElement>): void {
        screen.setLogin(e.target.value)
    }

    function onPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        screen.setPassword(e.target.value)
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
        e.preventDefault()
        screen.signIn()
    }

    return autorender(() => (
        <div className={styles.signInScreen}>
            <h1 className={styles.signInScreenTitle}>LMS++</h1>
            <form className={styles.form} onSubmit={onSubmit}>
                <p className={styles.formHeading}>Welcome back!</p>
                <Field label="Login">
                    <Input id="sign-in-login"
                        value={screen.login}
                        onChange={onLogin}
                        className={styles.input} />
                </Field>
                <Field label="Password">
                    <Input id="sign-in-password"
                        value={screen.password}
                        onChange={onPassword}
                        type="password"
                        className={styles.input} />
                </Field>
                <Button className={styles.submit} variant="primary">Sign in</Button>
            </form>
        </div>
    ), [screen])
}
