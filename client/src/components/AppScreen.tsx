import React from "react"
import * as models from "../models"
import styles from "./AppScreen.module.scss"
import { autorender } from "./autorender"
import { DemoView } from "./demo/DemoView"
import { OptionsView } from "./options/OptionsView"
import { Side, SidePanel } from "./SidePanel"
import { TasksView } from "./tasks/TasksView"
import { ViewBar } from "./ViewBar"
import { SolutionsView } from "./views/SolutionsView"

interface AppScreenProps {
  model: models.App
}

function content(model: models.App): JSX.Element | undefined {
  switch (model.activeView) {
    case model.tasksView:
      return <TasksView model={model.tasksView} />
    case model.solutionsView:
      return <SolutionsView model={model.solutionsView} />
    case model.demoView:
      return <DemoView model={model.demoView} />
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

AppScreen.MainPanel = function MainPanel({ children }: MainPanelProps): JSX.Element {
  return <div className={styles.mainPanel}>{children}</div>
}

interface SidePanelProps {
  model: models.SidePanel
  pulsing?: boolean
  children?: React.ReactNode
}

AppScreen.LeftPanel = function LeftPanel(props: SidePanelProps): JSX.Element {
  const { model, children, pulsing } = props
  return (
    <SidePanel
      model={model}
      side={Side.Left}
      pulsing={pulsing}
      panelClassName={styles.sidePanel}
      toggleClassName={styles.sidePanelToggle}
    >
      {children}
    </SidePanel>
  )
}

AppScreen.RightPanel = function RightPanel(props: SidePanelProps): JSX.Element {
  const { model, children, pulsing } = props
  return (
    <SidePanel
      model={model}
      side={Side.Right}
      pulsing={pulsing}
      panelClassName={styles.sidePanel}
      toggleClassName={styles.sidePanelToggle}
    >
      {children}
    </SidePanel>
  )
}
