import React from "react"
import * as models from "../models"
import { View } from "../models"
import styles from "./AppScreen.module.scss"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { OptionsView } from "./options/OptionsView"
import { Permissions } from "./permissions"
import { TasksView } from "./tasks/TasksView"
import { combineClassNames, maybeValue } from "./utils"

interface AppScreenProps {
  model: models.App
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  return autorender(() => (
    <Permissions permissions={model.database.permissions}>
      <div className={styles.screen}>
        <div className={styles.viewSwitch}>
          {button(model, model.tasksView)}
          {button(model, model.optionsView)}
        </div>
        <div className={styles.viewContent}>{viewContent(model)}</div>
      </div>
    </Permissions>
  ), [model])
}

function button(model: models.App, view: View): JSX.Element {
  const variant = model.viewGroup.activeView === view ? "primary" : "secondary"
  return (
    <Button
      variant={variant}
      onClick={() => model.viewGroup.setActive(view)}
      className={combineClassNames(getViewToggleClassName(model, view))}
    />
  )
}

function getViewToggleClassName(model: models.App, view: View): string | undefined {
  switch (view) {
    case model.tasksView:
      return styles.tasks
    case model.optionsView:
      return styles.options
  }
}

function viewContent(model: models.App): JSX.Element {
  const tasksViewClassName = combineClassNames(maybeValue(styles.viewContentHidden,
                                                          isViewHidden(model, model.tasksView)))
  const optionsViewClassName = combineClassNames(maybeValue(styles.viewContentHidden,
                                                            isViewHidden(model, model.optionsView)))
  return (
    <>
      <div className={tasksViewClassName}><TasksView model={model.tasksView} /></div>
      <div className={optionsViewClassName}><OptionsView model={model.optionsView} /></div>
    </>
  )
}

function isViewHidden(model: models.App, view: models.View): boolean {
  return model.viewGroup.activeView !== view
}
