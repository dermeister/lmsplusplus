import React from "react"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { Permissions } from "../permissions"
import { ViewGroup } from "../ViewGroup"
import styles from "./WorkbenchScreen.module.scss"
import { WorkbenchScreenModel } from "./WorkbenchScreen.model"
import { Transaction } from "reactronic"

interface AppViewProps {
    model: WorkbenchScreenModel
}

export function WorkbenchView({ model }: AppViewProps): JSX.Element {
    return autorender(() => {
        return (
            <Permissions permissions={model.context.permissions}>
                <div className={styles.screen}>
                    <div className={styles.viewSwitch}>{renderViewGroupSwitch(model)}</div>
                    <div className={styles.sidePanel}>
                        {model.sidePanel.render(model.currentViewGroup.currentView.renderSidePanelContent())}
                    </div>
                    <div className={styles.content}>{model.currentViewGroup.currentView.renderMainPanelContent()}</div>
                </div>
            </Permissions>
        )
    })
}

function renderViewGroupSwitch(model: WorkbenchScreenModel): JSX.Element[] {
    return model.viewGroups.map(v => {
        const variant = model.currentViewGroup === v ? "primary" : "secondary"
        return (
            <Button key={v.id}
                variant={variant}
                onClick={() => onViewGroupSwitchButtonClick(model, v)}
                className={styles.viewSwitchButton}>
                <img className={styles.viewSwitchButtonIcon} src={v.iconUrl} alt={v.id} />
            </Button>
        )
    })
}

function onViewGroupSwitchButtonClick(model: WorkbenchScreenModel, viewGroup: ViewGroup): void {
    if (model.currentViewGroup !== viewGroup) {
        Transaction.run(() => {
            model.showViewGroup(viewGroup)
            model.sidePanel.open()
        })
    } else
        model.sidePanel.toggle()
}
