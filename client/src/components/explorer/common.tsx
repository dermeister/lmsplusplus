import React, { createContext, ProviderProps, useContext } from "react"
import * as models from "../../models"
import { combineClassNames, maybeValue } from "../utils"
import styles from "./Explorer.module.scss"

export function buildNodeClassName(node: models.Node): string {
  return combineClassNames(styles.node,
                           maybeValue(styles.contextMenuOpened, node.contextMenu.isOpened))
}

const ExplorerModelContext = createContext<models.Explorer<unknown> | null>(null)

export function ExplorerModel(props: ProviderProps<models.Explorer<unknown> | null>): JSX.Element {
  return <ExplorerModelContext.Provider {...props} />
}

export function useExplorerModel<T extends models.Explorer<unknown>>(): T | null {
  return useContext(ExplorerModelContext as React.Context<T | null>)
}

const OffsetContext = createContext(Number(styles.offsetBase))

export function Offset(props: ProviderProps<number>): JSX.Element {
  return <OffsetContext.Provider {...props} />
}

export function useOffset(): number { return useContext(OffsetContext) }
