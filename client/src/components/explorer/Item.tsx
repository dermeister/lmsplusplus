import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { useContextMenu } from "../WindowManager"
import { buildNodeClassName, useExplorerModel, useOffset } from "./common"

interface ItemProps<T> {
  item: models.ItemNode<T>
  children?: React.ReactNode
}

export function Item<T>({ item, children }: ItemProps<T>): JSX.Element {
  const model = useExplorerModel<models.Explorer<T>>()
  const offset = useOffset()
  const onContextMenu = useContextMenu(item.contextMenu)

  function onClick(e: React.MouseEvent): void {
    if (e.target === e.currentTarget)
      model?.setSelectedNode(item)
  }

  return autorender(() => (
    <li key={item.key}>
      <p
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={buildNodeClassName(item)}
        style={{ paddingLeft: offset }}
      >
        {children}
      </p>
    </li>
  ), [item, children])
}
