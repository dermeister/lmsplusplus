import React from "react"
import * as models from "../models"
import { View } from "../models"
import styles from "./AppScreen.module.scss"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { OptionsView } from "./options/OptionsView"
import { MainView } from "./tasks/MainView"
import { combineClassNames, maybeValue } from "./utils"
import { ViewGroup } from "./ViewGroup"

interface AppScreenProps {
  model: models.App
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  function viewSwitch(viewGroup: models.ViewGroup): JSX.Element {
    const viewStylesIterable = [[model.mainView, styles.tasks], [model.optionsView, styles.options]]
    const viewSwitchStyles = new Map<View, string>(viewStylesIterable as [View, string][])

    function button(viewGroup: models.ViewGroup, view: View): JSX.Element {
      const className = combineClassNames(styles.viewButton,
                                          viewSwitchStyles.get(view),
                                          maybeValue(styles.selected, viewGroup.activeView === view))
      const variant = viewGroup.activeView === view ? "primary" : "secondary"
      return <Button variant={variant} onClick={() => viewGroup.setActiveView(view)} className={className} />
    }

    return (
      <div className={styles.viewBar}>
        {button(viewGroup, model.mainView)}
        {button(viewGroup, model.optionsView)}
      </div>
    )
  }

  function viewContent(viewGroup: models.ViewGroup): JSX.Element {
    switch (viewGroup.activeView) {
      case model.mainView:
        return <MainView model={model.mainView} />
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
