import React from "react"
import * as models from "../models"
import { View } from "../models"
import styles from "./AppScreen.module.scss"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { TasksView } from "./tasks/TasksView"
import { OptionsView } from "./options/OptionsView"
import { combineClassNames, maybeValue } from "./utils"
import { ViewGroup } from "./ViewGroup"

interface AppScreenProps {
  model: models.App
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  function viewSwitch(viewGroup: models.ViewGroup): JSX.Element {
    function getViewToggleClassName(view: View): string | undefined {
      switch (view) {
        case model.tasksView:
          return styles.tasks
        case model.optionsView:
          return styles.options
      }
    }

    function button(viewGroup: models.ViewGroup, view: View): JSX.Element {
      const className = combineClassNames(styles.viewButton,
                                          getViewToggleClassName(view),
                                          maybeValue(styles.selected, viewGroup.activeView === view))
      return (
        <Button
          variant={viewGroup.activeView === view ? "primary" : "secondary"}
          onClick={() => viewGroup.setActive(view)}
          className={className}
        />
      )
    }

    return (
      <div className={styles.viewBar}>
        {button(viewGroup, model.tasksView)}
        {button(viewGroup, model.optionsView)}
      </div>
    )
  }

  function viewContent(viewGroup: models.ViewGroup): JSX.Element {
    switch (viewGroup.activeView) {
      case model.tasksView:
        return <TasksView model={model.tasksView} />
      case model.optionsView:
        return <OptionsView model={model.optionsView} />
      default:
        throw new Error("Invalid view")
    }
  }

  return autorender(() => (
    <ViewGroup model={model.views} renderViewSwitch={viewSwitch} renderViewContent={viewContent} />
  ), [model])
}
