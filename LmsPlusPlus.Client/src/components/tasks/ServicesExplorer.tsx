import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Explorer } from "../explorer"
import { ContextMenu } from "../ContextMenu"

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

function contextMenu(c: models.ItemNode<models.Service>): JSX.Element {
    if (c.item.virtualPorts.length == 0)
        return <></>
    return (
        <ContextMenu model={c.contextMenu}>
            <ContextMenu.Submenu title="View">
                <ContextMenu.Button variant="primary" onClick={() => onOpenConsole(c)}>
                    Open console
                </ContextMenu.Button>
                {c.item.virtualPorts.map(p => (
                    <ContextMenu.Button key={p} variant="primary" onClick={() => onOpenWebview(c, p)}>
                        Open webview (port {p})
                    </ContextMenu.Button>
                ))}
            </ContextMenu.Submenu>
        </ContextMenu>
    )
}

function onOpenConsole(service: models.ItemNode<models.Service>): void {
    service.contextMenu.close()
    service.item.selectConsoleRenderer()
}

function onOpenWebview(service: models.ItemNode<models.Service>, port: number): void {
    service.contextMenu.close()
    service.item.selectWebRenderer(port)
}
