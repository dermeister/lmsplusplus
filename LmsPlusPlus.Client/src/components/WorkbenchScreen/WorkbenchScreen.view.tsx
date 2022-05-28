import React from "react"
import { Transaction } from "reactronic"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { SidePanel } from "../SidePanel"
import { ViewGroup } from "../ViewGroup"
import styles from "./WorkbenchScreen.module.scss"

interface WorkbenchScreenProps {
    currentViewGroup: ViewGroup
    viewGroups: ViewGroup[]
    sidePanel: SidePanel
    onShowViewGroup: (viewGroup: ViewGroup) => void
}

export function WorkbenchScreen({ currentViewGroup, viewGroups, sidePanel, onShowViewGroup }: WorkbenchScreenProps): JSX.Element {
    function renderViewGroupSwitch(): JSX.Element[] {
        return viewGroups.map(v => {
            const variant = currentViewGroup === v ? "primary" : "secondary"
            return (
                <Button key={v.id}
                    variant={variant}
                    onClick={() => onViewGroupSwitchButtonClick(v, currentViewGroup)}
                    className={styles.viewGroupSwitchButton}>
                    <img className={styles.viewGroupSwitchButtonIcon} src={v.iconUrl} alt={v.id} />
                </Button>
            )
        })
    }

    function onViewGroupSwitchButtonClick(viewGroup: ViewGroup, currentViewGroup: ViewGroup): void {
        if (currentViewGroup !== viewGroup)
            Transaction.run(() => {
                onShowViewGroup(viewGroup)
                sidePanel.open()
            })
        else
            sidePanel.toggle()
    }

    return autorender(() => (
        <div className={styles.workbenchScreen}>
            <div className={styles.viewGroupSwitch}>{renderViewGroupSwitch()}</div>
            <div className={styles.sidePanel}>
                {sidePanel.render(currentViewGroup.currentView.renderSidePanelContent())}
            </div>
            <div className={styles.mainPanelContent}>
                {currentViewGroup.currentView.renderMainPanelContent()}
            </div>
        </div>
    ), [currentViewGroup, viewGroups, sidePanel, onShowViewGroup])
}

