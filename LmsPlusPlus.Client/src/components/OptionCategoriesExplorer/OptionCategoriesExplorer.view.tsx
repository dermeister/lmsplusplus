import React from "react"
import { autorender } from "../autorender"
import { Explorer } from "../Explorer"
import { OptionCategoriesExplorerModel } from "./OptionCategoriesExplorer.model"

interface OptionCategoriesViewProps {
    model: OptionCategoriesExplorerModel
}

export function OptionCategoriesExplorerView({ model }: OptionCategoriesViewProps): JSX.Element {
    return autorender(() => (
        <Explorer model={model}>
            {model.children.map(c => <Explorer.Item key={c.key} item={c}>{c.title}</Explorer.Item>)}
        </Explorer>
    ), [model])
}
