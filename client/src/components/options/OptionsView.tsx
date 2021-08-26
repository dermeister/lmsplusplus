import React from "react"
import * as models from "../../models"
import { OptionCategory } from "../../models"
import { AppScreen } from "../AppScreen"
import { useAuth } from "../auth"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { OptionCategories } from "./OptionCategories"
import styles from "./OptionsView.module.scss"
import { Preferences } from "./Preferences"
import { Vcs } from "./Vcs"

interface OptionsViewProps {
  model: models.OptionsView
}

export function OptionsView({ model }: OptionsViewProps): JSX.Element {
  const auth = useAuth()

  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel}>
        <div className={styles.leftPanelContent}>
          <OptionCategories model={model.categories} />
          <Button variant="danger" onClick={() => auth.signOut()} className={styles.signOut}>
            Sign out
          </Button>
        </div>
      </AppScreen.LeftPanel>
      <AppScreen.MainPanel>{content(model)}</AppScreen.MainPanel>
    </>
  ), [model])
}

function content(model: models.OptionsView): JSX.Element {
  let body: JSX.Element
  switch (model.categories.selectedCategory) {
    case OptionCategory.Vsc:
      body = <Vcs model={model.options} />
      break
    case OptionCategory.Preferences:
      body = <Preferences model={model.options} />
      break
  }
  return (
    <div className={styles.centeringWrapper}>
      <div className={styles.content}>{body}</div>
    </div>
  )
}
