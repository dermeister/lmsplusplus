import React from "react"
import * as models from "../../models"
import { autorender } from "../autorender"
import { combineClassNames, maybeValue } from "../utils"
import { buildNodeClassName, useExplorerModel, useOffset } from "./common"
import styles from "./Explorer.module.scss"

interface GroupProps {
    group: models.GroupNode
    contextMenu?: React.ReactNode
    children?: React.ReactNode
}

export function Group({ group, children, contextMenu }: GroupProps): JSX.Element {
    const offset = useOffset()
    const model = useExplorerModel()
    // const onContextMenu = useContextMenu(group.contextMenu)

    function onClick(e: React.MouseEvent): void {
        if (e.target === e.currentTarget)
            group.toggle()
    }

    return autorender(() => {
        const className = combineClassNames(buildNodeClassName(group), styles.group,
            maybeValue(styles.opened, group.isOpened))
        return (
            <p onClick={onClick}
                onContextMenu={(e) => {
                    e.preventDefault()
                    model.contextMenuService.open(group.contextMenu, e.clientX, e.clientY)
                }}
                className={className}
                style={{ paddingLeft: offset }}>
                {children}
                {contextMenu}
            </p>
        )
    }, [group, children, contextMenu])
}
