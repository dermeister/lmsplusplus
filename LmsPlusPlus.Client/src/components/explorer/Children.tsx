import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { Offset, useOffset } from "./common"
import styles from "./Explorer.module.scss"

interface ChildrenProps {
  group: models.GroupNode
  children?: React.ReactNode
}

export function Children({ group, children }: ChildrenProps): JSX.Element {
  const offset = useOffset()

  return autorender(() => {
    if (!group.isOpened)
      return <></>
    return (
      <ul className={styles.list}>
        <Offset value={offset + Number(styles.offsetDelta)}>{children}</Offset>
      </ul>
    )
  }, [group, children])
}
