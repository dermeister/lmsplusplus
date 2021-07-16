import React from "react"
import { Models } from "../models"
import { AppScreen } from "./AppScreen"
import autorender from "./autorender"
import styles from "./Root.module.scss"
import { SignInScreen } from "./SignInScreen"
import { WindowManager } from "./WindowManager"

interface RootProps {
  model: Models.Root
}

export function Root({ model }: RootProps): JSX.Element {
  return autorender(
    () => (
      <WindowManager model={model.windowManager}>
        <div className={styles.root}>{content(model)}</div>
      </WindowManager>
    ),
    [model]
  )
}

function content(model: Models.Root): JSX.Element {
  if (!model.auth.user)
    return <AppScreen model={model.app} />
  return <SignInScreen model={model.signIn} />
}
