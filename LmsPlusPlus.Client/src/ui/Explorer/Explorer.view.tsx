import React, { createContext, useContext } from "react"
import { autorender } from "../autorender"
import * as model from "./Explorer.model"
import explorerStyles from "./Explorer.module.scss"
import { Node } from "./Node.model"
import { OffsetContext } from "./Offset"
import offsetStyles from "./Offset.module.scss"

interface ExplorerProps<T> {
    explorer: model.Explorer<T>
    children: readonly Node<T>[]
}

const ExplorerModelContext = createContext<model.Explorer<unknown> | null>(null)

export function useExplorer<T extends model.Explorer<unknown>>(): T {
    const explorer = useContext(ExplorerModelContext as React.Context<T | null>)
    if (!explorer)
        throw new Error("Explorer model not provided.")
    return explorer
}

export function ExplorerView<T>({ explorer, children }: ExplorerProps<T>): JSX.Element {
    return autorender(() => (
        <ExplorerModelContext.Provider value={explorer}>
            <OffsetContext.Provider value={Number(offsetStyles.offsetBase)}>
                <ul className={explorerStyles.items}>
                    {children.map(c => <li key={c.key}>{c.render()}</li>)}
                </ul>
            </OffsetContext.Provider>
        </ExplorerModelContext.Provider>
    ), [explorer, children])
}
