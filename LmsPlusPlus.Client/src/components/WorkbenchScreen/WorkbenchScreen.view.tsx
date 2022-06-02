import React from "react"
import { Transaction } from "reactronic"
import { autorender } from "../autorender"
import { Button } from "../Button"
import { ViewGroup } from "../ViewGroup"
import * as model from "./WorkbenchScreen.model"
import styles from "./WorkbenchScreen.module.scss"

interface WorkbenchScreenProps {
    screen: model.WorkbenchScreen
}

export function WorkbenchScreen({ screen }: WorkbenchScreenProps): JSX.Element {
    function renderViewGroupSwitch(): JSX.Element[] {
        return screen.viewGroups.map(v => {
            const variant = screen.currentViewGroup === v ? "primary" : "secondary"
            return (
                <Button key={v.id}
                    variant={variant}
                    onClick={() => onViewGroupSwitchButtonClick(v, screen.currentViewGroup)}
                    className={styles.viewGroupSwitchButton}>
                    <img className={styles.viewGroupSwitchButtonIcon} src={v.iconUrl} alt={v.id} />
                </Button>
            )
        })
    }

    function onViewGroupSwitchButtonClick(viewGroup: ViewGroup, currentViewGroup: ViewGroup): void {
        if (currentViewGroup !== viewGroup)
            Transaction.run(null, () => {
                screen.showViewGroup(viewGroup)
                screen.sidePanel.open()
            })
        else
            screen.sidePanel.toggle()
    }

    return autorender(() => (
        <div className={styles.workbenchScreen}>
            <div className={styles.viewGroupSwitch}>{renderViewGroupSwitch()}</div>
            <div className={styles.sidePanel}>
                {screen.sidePanel.render(screen.currentViewGroup.currentView.renderSidePanelContent())}
            </div>
            <div className={styles.mainPanel}>
                {screen.currentViewGroup.currentView.renderMainPanelContent()}
            </div>
        </div>
    ), [screen])
}
