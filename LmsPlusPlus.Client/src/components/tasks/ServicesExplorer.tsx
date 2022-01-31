import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Explorer } from "../explorer"
import { ContextMenu, RadioItem } from "../ContextMenu"

interface ServicesExplorerProps {
    model: models.ServicesExplorer
}

export function ServicesExplorer({ model }: ServicesExplorerProps): JSX.Element {
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

function contextMenu(service: models.ItemNode<models.Service>): JSX.Element {
    if (service.item.virtualPorts.length == 0)
        return <></>
    return (
        <ContextMenu model={service.contextMenu}>
            <ContextMenu.Submenu title="View">
                <ContextMenu.RadioGroup items={createItems(service)}
                                        onValueChange={v => onServiceViewChange(service, v)}
                                        selectedValue={service.item.serviceView} />
            </ContextMenu.Submenu>
        </ContextMenu>
    )
}

function createItems(service: models.ItemNode<models.Service>): readonly RadioItem<models.ServiceView>[] {
    const items: RadioItem<models.ServiceView>[] = [{ title: "Open console", value: service.item.consoleServiceView }]
    service.item.webServiceViews.forEach(v => items.push({ title: `Open web page (port ${v.virtualPort})`, value: v }))
    return items
}

function onServiceViewChange(service: models.ItemNode<models.Service>, value: models.ServiceView): void {
    service.contextMenu.close()
    service.item.setServiceView(value)
}

