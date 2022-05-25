import React, { useRef } from "react"
import { autorender } from "../autorender"
import { ContextMenuDelegate } from "../ContextMenuService"
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
        const ref = useRef<HTMLParagraphElement>(null)

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
            const contextMenu = model.renderContextMenu()
            if (contextMenu && model.contextMenuService) {
                const onClose = () => ref.current?.classList.remove(nodeStyles.contextMenuOpened)
                const contextMenuDelegate = new ContextMenuDelegate(contextMenu, e.clientX, e.clientY, onClose)
                model.contextMenuService.open(contextMenuDelegate)
                ref.current?.classList.add(nodeStyles.contextMenuOpened)
            }
        }

        function renderGroupNode(): JSX.Element {
            const className = combineClassNames(nodeStyles.node, nodeStyles.group, maybeValue(nodeStyles.opened, model.isOpened))
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
                        ref={ref}
                        style={{ paddingLeft: offset }}>
                        {model.title}
                    </p>
                    {children}
                </>
            )
        }

        function renderItemNode(): JSX.Element {
            const className = combineClassNames(nodeStyles.node, maybeValue(nodeStyles.selected, explorerModel.selectedNode === model))
            return (
                <p onClick={onClick}
                    onContextMenu={e => onContextMenu(e, model)}
                    className={className}
                    ref={ref}
                    style={{ paddingLeft: offset }}>
                    {model.title}
                </p>
            )
        }

        return model.isGroupNode ? renderGroupNode() : renderItemNode()
    }, [model])
}
