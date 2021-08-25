import React from "react"
import * as models from "../../models"
import { OptionCategory } from "../../models"
import { AppScreen } from "../AppScreen"
import { useAuth } from "../auth"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Dropdown } from "../Dropdown"
import { Field } from "../Field"
import { OptionCategories } from "./OptionCategories"
import styles from "./OptionsView.module.scss"

interface OptionsViewProps {
  model: models.OptionsView
}

export function OptionsView({ model }: OptionsViewProps): JSX.Element {
  const auth = useAuth()

  return autorender(() => (
    <>
      <AppScreen.LeftPanel model={model.leftPanel}>
        <OptionCategories model={model.categories} className={styles.categories} />
        <Button variant="danger" onClick={() => auth.signOut()} className={styles.signOut}>
          Sign out
        </Button>
      </AppScreen.LeftPanel>
      <AppScreen.MainPanel>{content(model)}</AppScreen.MainPanel>
    </>
  ), [model])
}

function content(model: models.OptionsView): JSX.Element {
  let body: JSX.Element
  switch (model.categories.currentCategory) {
    case OptionCategory.Vsc:
      body = <span>VSC</span>
      break
    case OptionCategory.Preferences:
      body = preferences(model.options)
      break
  }
  return <div className={styles.content}>{body}</div>
}

function preferences(options: models.Options): JSX.Element {
  return (
    <>
      <Field label="Theme" className={styles.field}>
        <Dropdown
          active={options.darkMode ? "Dark" : "Light"}
          options={["Dark", "Light"]}
          onChange={v => options.setDarkMode(v === "Dark")}
        />
      </Field>
    </>
  )
}