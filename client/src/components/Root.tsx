import React from "react"
import * as models from "../models"
import { AppScreen } from "./AppScreen"
import { Auth } from "./auth"
import { autorender } from "./autorender"
import { SignInScreen } from "./SignInScreen"
import { WindowManager } from "./WindowManager"

interface RootProps {
  model: models.Root
}

export function Root({ model }: RootProps): JSX.Element {
  return autorender(() => (
    <WindowManager model={model.windowManager}>
      <Auth auth={model.auth}>
        {content(model)}
      </Auth>
    </WindowManager>
  ), [model])
}

function content(model: models.Root): JSX.Element {
  if (model.app)
    return <AppScreen model={model.app} />
  return <SignInScreen model={model.signIn} />
}
