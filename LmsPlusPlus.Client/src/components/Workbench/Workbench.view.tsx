import React from "react";
import { autorender } from "../autorender";
import { Button } from "../Button";
import { View } from "../View";
import { WorkbenchModel } from "./Workbench.model";
import styles from "./Workbench.module.scss"
import { Permissions } from "../permissions"
import { WindowManager } from "../WindowManager";
import { ViewGroup } from "../ViewGroup";

interface AppViewProps {
    model: WorkbenchModel
}

export function WorkbenchView({ model }: AppViewProps): JSX.Element {
    return autorender(() => {
        return (
            <WindowManager model={model.windowManager}>
                <Permissions permissions={model.context.permissions}>
                    <div className={styles.screen}>
                        <div className={styles.viewSwitch}>{renderViewSwitch(model)}</div>
                        <div className={styles.sidePanel}>{model.sidePanel.render(model.currentViewGroup.currentView.renderSidePanelContent())}</div>
                        <div className={styles.content}>{model.currentViewGroup.currentView.renderMainPanelContent()}</div>
                    </div>
                </Permissions>
            </WindowManager>
        )
    })
}

function renderViewSwitch(model: WorkbenchModel): JSX.Element[] {
    return model.viewGroups.map(v => {
        const variant = model.currentViewGroup === v ? "primary" : "secondary"
        return (
            <Button key={v.id}
                variant={variant}
                onClick={() => onViewSwitchButtonClick(model, v)}
                className={styles.viewSwitchButton}>
                <img className={styles.viewSwitchButtonIcon} src={v.iconUrl} alt={v.id} />
            </Button>
        )
    })
}

function onViewSwitchButtonClick(model: WorkbenchModel, viewGroup: ViewGroup): void {
    if (model.currentViewGroup !== viewGroup) {
        model.showViewGroup(viewGroup)
        model.sidePanel.open()
    } else
        model.sidePanel.toggle()
}
