import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { combineClassNames, maybeValue } from "../utils"
import { useContextMenu } from "../WindowManager"
import { buildNodeClassName, useExplorerModel, useOffset } from "./common"
import styles from "./Explorer.module.scss"

interface ItemProps<T> {
  item: models.ItemNode<T>
  contextMenu?: React.ReactNode
  children?: React.ReactNode
}

export function Item<T>({ item, children, contextMenu }: ItemProps<T>): JSX.Element {
  const model = useExplorerModel<models.Explorer<T>>()
  const offset = useOffset()
  const onContextMenu = useContextMenu(item.contextMenu)

  function onClick(e: React.MouseEvent): void {
    if (e.target === e.currentTarget)
      model?.setSelectedNode(item)
  }

  return autorender(() => {
    const className = combineClassNames(buildNodeClassName(item),
                                        maybeValue(styles.selected, model.selectedNode === item))
    return (
      <li key={item.key}>
        <p
          onClick={onClick}
          onContextMenu={contextMenu ? onContextMenu : undefined}
          className={className}
          style={{ paddingLeft: offset }}
        >
          {children}
          {contextMenu}
        </p>
      </li>
    )
  }, [item, children, contextMenu])
}
