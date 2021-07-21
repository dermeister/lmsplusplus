import React from "react"
import { Models } from "../../models"
import { autorender } from "../autorender"
import { useContextMenu } from "../WindowManager"
import { buildNodeClassName, useExplorerModel, useOffset } from "./common"

interface ItemProps<T> {
  item: Models.ItemNode<T>
  children?: React.ReactNode
}

export function Item<T>({ item, children }: ItemProps<T>): JSX.Element {
  const model = useExplorerModel<Models.Explorer<T>>()
  const offset = useOffset()
  const onContextMenu = useContextMenu(item.contextMenu)

  return autorender(() => (
    <li key={item.key}>
      <p
        onClick={() => model?.setSelectedNode(item)}
        onContextMenu={onContextMenu}
        className={buildNodeClassName(item)}
        style={{ paddingLeft: offset }}
      >
        {children}
      </p>
    </li>
  ), [item, children])
}
