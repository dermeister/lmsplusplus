import React from "react"
import styles from "./MainScreen.module.scss"
import { autorender } from "./autorender"
import { Button } from "./Button"
import { OptionsViewMainPanelContent, OptionsViewSidePanelContent } from "./options/OptionsView"
import { Permissions } from "./permissions"
import { TasksViewMainPanelContent, TasksViewSidePanelContent } from "./tasks/TasksView"
import { combineClassNames } from "./utils"
import * as models from "../models"
import { SidePanel } from "./SidePanel"

interface MainScreenProps {
    model: models.MainScreen
}

export function MainScreen({ model }: MainScreenProps): JSX.Element {
    return autorender(() => (
        <Permissions permissions={model.permissions}>
            <div className={styles.screen}>
                {viewSwitch(model)}
                {viewSidePanel(model)}
                {viewContent(model)}
            </div>
        </Permissions>
    ), [model])
}

function viewSwitch(model: models.MainScreen): JSX.Element {
    return (
        <div className={styles.viewSwitch}>
            {button(model, models.MainScreen.TASKS_VIEW_ID)}
            {button(model, models.MainScreen.OPTIONS_VIEW_ID)}
        </div>
    )
}

function button(model: models.MainScreen, viewId: string): JSX.Element {
    const variant = model.openedView.id === viewId ? "primary" : "secondary"
    return (
        <Button
            variant={variant}
            onClick={() => model.toggleView(viewId)}
            className={combineClassNames(getViewToggleClassName(model, viewId))}
        />
    )
}

function viewSidePanel(model: models.MainScreen): JSX.Element | undefined {
    let sidePanelContent: JSX.Element | undefined
    switch (model.openedView.id) {
        case models.MainScreen.TASKS_VIEW_ID:
            sidePanelContent = <TasksViewSidePanelContent model={model.openedView as models.TasksView} />
            break
        case models.MainScreen.OPTIONS_VIEW_ID:
            sidePanelContent = <OptionsViewSidePanelContent model={model.openedView as models.OptionsView} />
            break
    }
    if (sidePanelContent)
        return (
            <div className={styles.viewSidePanel}>
                <SidePanel model={model.sidePanel}>{sidePanelContent}</SidePanel>
            </div>
        )
}

function getViewToggleClassName(model: models.MainScreen, viewId: string): string | undefined {
    switch (viewId) {
        case models.MainScreen.TASKS_VIEW_ID:
            return styles.tasks
        case models.MainScreen.OPTIONS_VIEW_ID:
            return styles.options
    }
}

function viewContent(model: models.MainScreen): JSX.Element | undefined {
    let content: JSX.Element | undefined
    switch (model.openedView.id) {
        case models.MainScreen.TASKS_VIEW_ID:
            content = <TasksViewMainPanelContent model={model.openedView as models.TasksView} />
            break
        case models.MainScreen.OPTIONS_VIEW_ID:
            content = <OptionsViewMainPanelContent model={model.openedView as models.OptionsView} />
            break
    }
    if (content)
        return <div className={styles.viewContent}>{content}</div>
}
