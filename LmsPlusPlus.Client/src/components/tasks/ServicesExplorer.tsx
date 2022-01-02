import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Explorer } from "../explorer"

interface ServicesExplorerProps {
    model: models.ServicesExplorer
}

export function ServicesExplorer({ model }: ServicesExplorerProps): JSX.Element {
    return autorender(() => (
        <Explorer model={model}>
            {model.children.map(c => <Explorer.Item key={c.key} item={c}>{c.title}</Explorer.Item>)}
        </Explorer>
    ), [model])
}
