import React from "react"
import * as models from "../../models"
import { ItemNode } from "../../models"
import { autorender } from "../autorender"
import { ServiceView } from "../SolutionRunnerView/ServiceView.model"
import { ServicesExplorer } from "./ServicesExplorer"

interface ServicesExplorerProps {
    model: ServicesExplorer
}

export function ServicesExplorerView({ model }: ServicesExplorerProps): JSX.Element {
    return autorender(() => (
        <div>TODO</div>
        // <Explorer model={model}>
        //     {model.children.map(c => (
        //         <Explorer.Item key={c.key}
        //             item={c}
        //             contextMenu={contextMenu(c)}>
        //             {c.title}
        //         </Explorer.Item>
        //     ))}
        // </Explorer>
    ), [model])
}

function contextMenu(service: models.ItemNode<ServiceView>): JSX.Element {
    if (service.item.virtualPorts.length == 0)
        return <></>
    return (
        <></>
        // <ContextMenuView model={service.contextMenu}>
        //     <ContextMenuView.Submenu title="View">
        //         <ContextMenuView.RadioGroup items={createItems(service)}
        //             onValueChange={v => onServiceViewChange(service, v)}
        //             selectedValue={service.item.serviceView} />
        //     </ContextMenuView.Submenu>
        // </ContextMenuView>
    )
}

// function createItems(service: ItemNode<Service>): readonly RadioItem<ServiceView>[] {
//     const items: RadioItem<ServiceView>[] = [{ title: "Open console", value: service.item.consoleServiceView }]
//     service.item.webServiceViews.forEach(v => items.push({ title: `Open web page (port ${v.virtualPort})`, value: v }))
//     return items
// }

// function onServiceViewChange(service: ItemNode<ServiceView>, value: ServiceView1): void {
//     // service.contextMenu.close()
//     service.item.setServiceView(value)
// }

