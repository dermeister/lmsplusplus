import React, { useRef } from "react"
import { autorender } from "../autorender"
import { ContextMenuDelegate, IContextMenuService } from "../ContextMenuService"
import { combineClassNames, maybeValue } from "../utils"
import { useExplorer } from "./Explorer.view"
import * as model from "./Node.model"
import nodeStyles from "./Node.module.scss"
import { OffsetContext, useOffset } from "./Offset"
import offsetStyles from "./Offset.module.scss"

interface NodeProps<T> {
    node: model.Node<T>
    contextMenuService: IContextMenuService | null
}

export function Node<T>({ node, contextMenuService }: NodeProps<T>): JSX.Element {
    const explorer = useExplorer()
    const offset = useOffset()
    const ref = useRef<HTMLParagraphElement>(null)

    return autorender(() => {
        function onClick(e: React.MouseEvent): void {
            if (e.target === e.currentTarget) {
                if (node.isGroupNode)
                    node.toggle()
                else
                    explorer.setSelectedNode(node)
            }
        }

        function onContextMenu(e: React.MouseEvent): void {
            e.preventDefault()
            const contextMenuItems = node.renderContextMenuItems()
            if (contextMenuItems && contextMenuItems.length > 0 && contextMenuService) {
                const onClose = () => ref.current?.classList.remove(nodeStyles.contextMenuOpened)
                const contextMenuDelegate = new ContextMenuDelegate(contextMenuItems, e.clientX, e.clientY, onClose)
                contextMenuService.open(contextMenuDelegate)
                ref.current?.classList.add(nodeStyles.contextMenuOpened)
            }
        }

        function renderGroupNode(): JSX.Element {
            const className = combineClassNames(nodeStyles.node, nodeStyles.group, maybeValue(nodeStyles.opened, node.isOpened))
            let children: JSX.Element
            if (!node.isOpened)
                children = <></>
            else
                children = (
                    <ul className={nodeStyles.list}>
                        <OffsetContext.Provider value={offset + Number(offsetStyles.offsetDelta)}>
                            {node.children!.map(c => <li key={c.key}>{c.render()}</li>)}
                        </OffsetContext.Provider>
                    </ul>
                )
            return (
                <>
                    <p onClick={onClick}
                        onContextMenu={onContextMenu}
                        className={className}
                        ref={ref}
                        style={{ paddingLeft: offset }}>
                        {node.title}
                    </p>
                    {children}
                </>
            )
        }

        function renderItemNode(): JSX.Element {
            const className = combineClassNames(nodeStyles.node, maybeValue(nodeStyles.selected, explorer.selectedNode === node))
            return (
                <p onClick={onClick}
                    onContextMenu={onContextMenu}
                    className={className}
                    ref={ref}
                    style={{ paddingLeft: offset }}>
                    {node.title}
                </p>
            )
        }

        return node.isGroupNode ? renderGroupNode() : renderItemNode()
    }, [node, contextMenuService])
}
