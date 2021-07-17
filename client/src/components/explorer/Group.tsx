import React from "react"
import { FaChevronRight } from "react-icons/fa"
import { Models } from "../../models"
import { autorender } from "../autorender"
import { useContextMenu } from "../WindowManager"
import { buildNodeClassName, useOffset } from "./common"
import styles from "./Explorer.module.scss"

interface GroupProps {
  group: Models.GroupNode
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

function arrow(group: Models.GroupNode): JSX.Element {
  let className = styles.arrow
  if (group.isOpened)
    className += ` ${styles.arrowOpened}`
  return <FaChevronRight size={10} className={className} />
}
