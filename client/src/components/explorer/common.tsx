import React, { createContext, ProviderProps, useContext } from "react"
import { Models } from "../../models"
import styles from "./Explorer.module.scss"

export function buildNodeClassName(node: Models.Node): string {
  let className = styles.node
  if (node.contextMenu.isOpened)
    className += ` ${styles.contextMenuOpened}`
  return className
}

const ExplorerModelContext = createContext<Models.Explorer<unknown> | null>(null)

export function ExplorerModel(props: ProviderProps<Models.Explorer<unknown> | null>): JSX.Element {
  return <ExplorerModelContext.Provider {...props} />
}

export function useExplorerModel<T extends Models.Explorer<unknown>>(): T | null {
  return useContext(ExplorerModelContext as React.Context<T | null>)
}

const OffsetContext = createContext(Number(styles.offsetBase))

export function Offset(props: ProviderProps<number>): JSX.Element {
  return <OffsetContext.Provider {...props} />
}

export function useOffset(): number {
  return useContext(OffsetContext)
}
