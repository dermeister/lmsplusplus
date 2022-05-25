import React from "react"
import { autorender } from "../autorender"
import { combineClassNames, maybeValue } from "../utils"
import { useExplorerModel } from "./Explorer.view"
import { NodeModel } from "./Node.model"
import nodeStyles from "./Node.module.scss"
import { OffsetContext, useOffset } from "./Offset"
import offsetStyles from "./Offset.module.scss"

interface NodeViewProps<T> {
    model: NodeModel<T>
}

export function NodeView<T>({ model }: NodeViewProps<T>): JSX.Element {
    return autorender(() => {
        const explorerModel = useExplorerModel()
        const offset = useOffset()

        function onClick(e: React.MouseEvent): void {
            if (e.target === e.currentTarget) {
                if (model.isGroupNode)
                    model.toggle()
                else
                    explorerModel.setSelectedNode(model)
            }
        }

        function onContextMenu<T>(e: React.MouseEvent, model: NodeModel<T>): void {
            e.preventDefault()
            model.onContextMenu(e.clientX, e.clientY)
        }

        function renderGroupNode(): JSX.Element {
            const className = combineClassNames(buildNodeClassName(model), nodeStyles.group, maybeValue(nodeStyles.opened, model.isOpened))
            let children: JSX.Element
            if (!model.isOpened)
                children = <></>
            else
                children = (
                    <ul className={nodeStyles.list}>
                        <OffsetContext.Provider value={offset + Number(offsetStyles.offsetDelta)}>
                            {model.children!.map(c => <li key={c.key}>{c.render()}</li>)}
                        </OffsetContext.Provider>
                    </ul>
                )
            return (
                <>
                    <p onClick={onClick}
                        onContextMenu={e => onContextMenu(e, model)}
                        className={className}
                        style={{ paddingLeft: offset }}>
                        {model.title}
                    </p>
                    {children}
                </>
            )
        }

        function renderItemNode(): JSX.Element {
            const className = combineClassNames(buildNodeClassName(model), maybeValue(nodeStyles.selected, explorerModel.selectedNode === model))
            return (
                <p onClick={onClick}
                    onContextMenu={e => onContextMenu(e, model)}
                    className={className}
                    style={{ paddingLeft: offset }}>
                    {model.title}
                </p>
            )
        }

        return model.isGroupNode ? renderGroupNode() : renderItemNode()
    }, [model])
}

function buildNodeClassName<T>(node: NodeModel<T>): string {
    return combineClassNames(nodeStyles.node, maybeValue(nodeStyles.contextMenuOpened, false)) // todo: fix
}
