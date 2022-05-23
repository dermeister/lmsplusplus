import React from "react"
import { Transaction } from "reactronic"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { ViewGroup } from "../ViewGroup"
import { WorkbenchScreenModel } from "./WorkbenchScreen.model"
import styles from "./WorkbenchScreen.module.scss"

interface WorkbenchScreenViewProps {
    model: WorkbenchScreenModel
}

export function WorkbenchScreenView({ model }: WorkbenchScreenViewProps): JSX.Element {
    return autorender(() => (
        <div className={styles.workbenchScreen}>
            <div className={styles.viewGroupSwitch}>{renderViewGroupSwitch(model)}</div>
            <div className={styles.sidePanel}>
                {model.sidePanel.render(model.currentViewGroup.currentView.renderSidePanelContent())}
            </div>
            <div className={styles.mainPanelContent}>{model.currentViewGroup.currentView.renderMainPanelContent()}</div>
        </div>
    ))
}

function renderViewGroupSwitch(model: WorkbenchScreenModel): JSX.Element[] {
    return model.viewGroups.map(v => {
        const variant = model.currentViewGroup === v ? "primary" : "secondary"
        return (
            <Button key={v.id}
                variant={variant}
                onClick={() => onViewGroupSwitchButtonClick(model, v)}
                className={styles.viewGroupSwitchButton}>
                <img className={styles.viewGroupSwitchButtonIcon} src={v.iconUrl} alt={v.id} />
            </Button>
        )
    })
}

function onViewGroupSwitchButtonClick(model: WorkbenchScreenModel, viewGroup: ViewGroup): void {
    if (model.currentViewGroup !== viewGroup)
        Transaction.run(() => {
            model.showViewGroup(viewGroup)
            model.sidePanel.open()
        })
    else
        model.sidePanel.toggle()
}
