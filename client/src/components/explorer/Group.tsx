import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { useContextMenu } from "../WindowManager"
import { buildNodeClassName, useOffset } from "./common"
import styles from "./Explorer.module.scss"

interface GroupProps {
  group: models.GroupNode
  children?: React.ReactNode
}

export function Group({ group, children }: GroupProps): JSX.Element {
  const offset = useOffset()
  const onContextMenu = useContextMenu(group.contextMenu)

  function onClick(e: React.MouseEvent): void {
    if (e.target === e.currentTarget)
      group.toggle()
  }

  return autorender(() => (
    <p
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={buildGroupClassName(group)}
      style={{ paddingLeft: offset }}
    >
      {children}
    </p>
  ), [group, children])
}

function buildGroupClassName(group: models.GroupNode): string {
  let result = ` ${buildNodeClassName(group)} ${styles.group}`
  if (group.isOpened)
    result += ` ${styles.groupOpened}`
  return result
}
