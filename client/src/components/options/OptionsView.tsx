import React from "react"
import * as models from "../../models"
import * as services from "../../services"
import { useAuth } from "../auth"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { SidePanel } from "../SidePanel"
import { SubViewBar } from "../SubViewBar"
import { ViewGroup } from "../ViewGroup"
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
    <ViewGroup
      model={model.views}
      renderViewSwitch={() => viewSwitch(model)}
      renderViewContent={() => viewContent(model, auth)}
    />
  ), [model])
}

function viewSwitch(model: models.OptionsView): JSX.Element {
  return (
    <SubViewBar
      model={model.views}
      onToggleClick={() => model.sidePanel.toggle()}
    />
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
    <div className={styles.viewContent}>
      <SidePanel model={model.sidePanel}>
        <div className={styles.leftPanelContent}>
          <OptionCategories model={model.categories} />
          <Button variant="danger" onClick={() => auth.signOut()} className={styles.signOut}>
            Sign out
          </Button>
        </div>
      </SidePanel>
      <div className={styles.contentWrapper}>
        <div className={styles.content}>{body}</div>
      </div>
    </div>
  )
}


