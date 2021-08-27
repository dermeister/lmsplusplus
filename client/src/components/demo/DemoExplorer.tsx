import React from "react"
import { Service } from "../../domain/Demo"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Explorer } from "../explorer"

interface DemoExplorerProps {
  model: models.DemoExplorer
}

export function DemoExplorer({ model }: DemoExplorerProps): JSX.Element {
  return autorender(() => (
    <Explorer model={model}>{courses(model, model.children)}</Explorer>
  ), [model])
}

function courses(explorer: models.DemoExplorer, demos: readonly models.DemoNode[]): JSX.Element[] {
  return demos.map(demo => (
    <li key={demo.key}>
      <Explorer.Group group={demo}>
        {demo.title}
      </Explorer.Group>
      <Explorer.Children group={demo}>{services(explorer, demo.children)}</Explorer.Children>
    </li>
  ))
}

function services(explorer: models.DemoExplorer,
                  services: readonly models.ItemNode<Service>[]): JSX.Element[] {
  return services.map(service => (
    <Explorer.Item key={service.key} item={service}>
      {service.title}
    </Explorer.Item>
  ))
}
