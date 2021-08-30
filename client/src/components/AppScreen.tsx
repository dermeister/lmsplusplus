import React from "react"
import * as models from "../models"
import styles from "./AppScreen.module.scss"
import { autorender } from "./autorender"
import { OptionsView } from "./options/OptionsView"
import { SidePanelGroup } from "./SidePanelGroup"
import { TasksView } from "./tasks/TasksView"
import { ViewBar } from "./ViewBar"

interface AppScreenProps {
  model: models.App
}

function content(model: models.App): JSX.Element | undefined {
  switch (model.activeView) {
    case model.tasksView:
      return <TasksView model={model.tasksView} />
    case model.optionsView:
      return <OptionsView model={model.optionsView} />
  }
}

export function AppScreen({ model }: AppScreenProps): JSX.Element {
  return autorender(() => (
    <>
      <ViewBar model={model} className={styles.viewBar} />
      <div className={styles.content}>{content(model)}</div>
    </>
  ), [model])
}

interface MainPanelProps {
  children?: React.ReactNode
}

AppScreen.MainPanel = function AppScreenMainPanel({ children }: MainPanelProps): JSX.Element {
  return <div className={styles.mainPanel}>{children}</div>
}

AppScreen.SidePanelGroup = function AppScreenSidePanelGroup(
  props: React.ComponentProps<typeof SidePanelGroup>): JSX.Element {
  return <SidePanelGroup {...props} />
}
