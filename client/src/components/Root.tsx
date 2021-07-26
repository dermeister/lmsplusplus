import React from "react"
import * as models from "../models"
import { AppScreen } from "./AppScreen"
import { autorender } from "./autorender"
import styles from "./Root.module.scss"
import { SignInScreen } from "./SignInScreen"
import { WindowManager } from "./WindowManager"

interface RootProps {
  model: models.Root
}

export function Root({ model }: RootProps): JSX.Element {
  return autorender(() => (
    <WindowManager model={model.windowManager}>
      <div className={styles.root}>{content(model)}</div>
    </WindowManager>
  ), [model])
}

function content(model: models.Root): JSX.Element {
  if (model.app)
    return <AppScreen model={model.app} />
  else
    return <SignInScreen model={model.signIn} />
}
