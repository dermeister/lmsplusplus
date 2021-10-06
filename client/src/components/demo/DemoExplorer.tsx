import React from "react"
import * as domain from "../../domain"
import * as models from "../../models"
import { autorender } from "../autorender"
import { ContextMenu } from "../ContextMenu"
import { Explorer } from "../explorer"

interface DemoExplorerProps {
  model: models.DemoView
}

export function DemoExplorer({ model }: DemoExplorerProps): JSX.Element {
  return autorender(() => {
    if (model.explorer instanceof models.MultipleDemosExplorer)
      return <Explorer model={model.explorer}>{demos(model, model.explorer.children)}</Explorer>
    return <Explorer model={model.explorer}>{services(model, model.explorer.children)}</Explorer>
  }, [model])
}

function onStopDemo(model: models.DemoView, demo: models.DemoNode): void {
  demo.contextMenu?.close()
  model.stop(demo.item)
}

function demos(model: models.DemoView, demos: readonly models.DemoNode[]): JSX.Element[] {
  return demos.map(demo => {
    let contextMenu
    if (demo.contextMenu)
      contextMenu = (
        <ContextMenu model={demo.contextMenu}>
          <ContextMenu.Button onClick={() => onStopDemo(model, demo)}>Stop Demo</ContextMenu.Button>
        </ContextMenu>
      )
    return (
      <li key={demo.key}>
        <Explorer.Group group={demo}>
          {demo.title}
          {contextMenu}
        </Explorer.Group>
        <Explorer.Children group={demo}>{services(model, demo.children)}</Explorer.Children>
      </li>
    )
  })
}

function services(model: models.DemoView,
                  services: readonly models.ItemNode<domain.Service>[]): JSX.Element[] {
  return services.map(service => (
    <Explorer.Item key={service.key} item={service}>
      {service.title}
    </Explorer.Item>
  ))
}
