import React from "react"
import { FaChevronRight } from "react-icons/fa"
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

  return autorender(() => (
    <p
      onClick={() => group.toggle()}
      onContextMenu={onContextMenu}
      className={buildNodeClassName(group)}
      style={{ paddingLeft: offset }}
    >
      {arrow(group)}
      {children}
    </p>
  ), [group, children])
}

function arrow(group: models.GroupNode): JSX.Element {
  let className = styles.arrow
  if (group.isOpened)
    className += ` ${styles.arrowOpened}`
  return <FaChevronRight size={10} className={className} />
}
