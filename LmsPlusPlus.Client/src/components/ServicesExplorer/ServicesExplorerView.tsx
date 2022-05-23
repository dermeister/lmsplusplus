import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Explorer } from "../Explorer"
import { ContextMenuView, RadioItem } from "../ContextMenu"
import { ServicesExplorer } from "./ServicesExplorer"
import { Service } from "../SolutionRunnerView/service/Service"
import { ItemNode } from "../../models"
import { ServiceView } from "../SolutionRunnerView/service/ServiceView"

interface ServicesExplorerProps {
    model: ServicesExplorer
}

export function ServicesExplorerView({ model }: ServicesExplorerProps): JSX.Element {
    return autorender(() => (
        <Explorer model={model}>
            {model.children.map(c => (
                <Explorer.Item key={c.key}
                    item={c}
                    contextMenu={contextMenu(c)}>
                    {c.title}
                </Explorer.Item>
            ))}
        </Explorer>
    ), [model])
}

function contextMenu(service: models.ItemNode<Service>): JSX.Element {
    if (service.item.virtualPorts.length == 0)
        return <></>
    return (
        <ContextMenuView model={service.contextMenu}>
            <ContextMenuView.Submenu title="View">
                <ContextMenuView.RadioGroup items={createItems(service)}
                    onValueChange={v => onServiceViewChange(service, v)}
                    selectedValue={service.item.serviceView} />
            </ContextMenuView.Submenu>
        </ContextMenuView>
    )
}

function createItems(service: ItemNode<Service>): readonly RadioItem<ServiceView>[] {
    const items: RadioItem<ServiceView>[] = [{ title: "Open console", value: service.item.consoleServiceView }]
    service.item.webServiceViews.forEach(v => items.push({ title: `Open web page (port ${v.virtualPort})`, value: v }))
    return items
}

function onServiceViewChange(service: ItemNode<Service>, value: ServiceView): void {
    service.contextMenu.close()
    service.item.setServiceView(value)
}

