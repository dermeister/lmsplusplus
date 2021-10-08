import React from "react"
import * as models from "../../models"
import * as services from "../../services"
import { useAuth } from "../auth"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { SidePanel } from "../SidePanel"
import { SubviewSwitch } from "../SubviewSwitch"
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
    <div className={styles.options}>
      {viewSwitch(model)}
      {viewContent(model, auth)}
    </div>
  ), [model])
}

function viewSwitch(model: models.OptionsView): JSX.Element {
  return (
    <div className={styles.subviewSwitch}>
      <SubviewSwitch
        model={model.viewGroup}
        onToggleClick={() => model.sidePanel.toggle()}
      />
    </div>
  )
}

function viewContent(model: models.OptionsView, auth: services.Auth): JSX.Element {
  let body: JSX.Element
  switch (model.categories.selectedCategory) {
    case models.OptionCategory.Vsc:
      body = <Vcs model={model.options} />
      break
    case models.OptionCategory.Preferences:
      body = <Preferences model={model.options} />
      break
  }
  return (
    <>
      <div className={styles.sidePanel}>
        <SidePanel model={model.sidePanel}>
          <OptionCategories model={model.categories} />
          <Button variant="danger" onClick={() => auth.signOut()} className={styles.signOut}>
            Sign out
          </Button>
        </SidePanel>
      </div>
      <div className={styles.content}>{body}</div>
    </>
  )
}
