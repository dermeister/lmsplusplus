import React from "react"
import * as models from "../../models"
import { Children } from "./Children"
import { ExplorerModel, Offset } from "./common"
import styles from "./Explorer.module.scss"
import { Group } from "./Group"
import { Item } from "./Item"

interface ExplorerProps<T> {
    model: models.Explorer<T>
    children?: React.ReactNode
}

export function Explorer<T>({ model, children }: ExplorerProps<T>): JSX.Element {
    return (
        <ExplorerModel value={model}>
            <Offset value={Number(styles.offsetBase)}>
                <ul className={styles.list}>{children}</ul>
            </Offset>
        </ExplorerModel>
    )
}

Explorer.Group = Group
Explorer.Children = Children
Explorer.Item = Item
