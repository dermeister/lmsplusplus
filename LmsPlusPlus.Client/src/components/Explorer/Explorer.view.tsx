import React, { createContext, useContext } from "react"
import { autorender } from "../autorender"
import { ExplorerModel } from "./Explorer.model"
import explorerStyles from "./Explorer.module.scss"
import { OffsetContext } from "./Offset"
import offsetStyles from "./Offset.module.scss"

interface ExplorerProps<T> {
    model: ExplorerModel<T>
}

const ExplorerModelContext = createContext<ExplorerModel<unknown> | null>(null)

export function useExplorerModel<T extends ExplorerModel<unknown>>(): T {
    const model = useContext(ExplorerModelContext as React.Context<T | null>)
    if (!model)
        throw new Error("Explorer model not provided.")
    return model
}

export function ExplorerView<T>({ model }: ExplorerProps<T>): JSX.Element {
    return autorender(() => (
        <ExplorerModelContext.Provider value={model}>
            <OffsetContext.Provider value={Number(offsetStyles.offsetBase)}>
                <ul className={explorerStyles.list}>
                    {model.children.map(c => <li key={c.key}>{c.render()}</li>)}
                </ul>
            </OffsetContext.Provider>
        </ExplorerModelContext.Provider>
    ), [model])
}
