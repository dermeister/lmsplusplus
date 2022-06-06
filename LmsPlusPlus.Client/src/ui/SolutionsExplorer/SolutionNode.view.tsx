import React from "react"
import { ContextMenu } from "../ContextMenuService"
import * as model from "./SolutionNode.model"

export function renderContextMenuItems(node: model.SolutionNode): JSX.Element[] {
    function onOpenSolution(): void {
        node.contextMenuService.close()
        window.open(node.item.websiteUrl as string, "_blank")
    }

    function onCopySolutionCopyUrl(): void {
        node.contextMenuService.close()
        navigator.clipboard.writeText(node.item.cloneUrl as string)
    }

    function onRunSolution(): void {
        node.contextMenuService.close()
        node.solutionsService.runSolution(node.item)
    }

    let key = 1
    return [
        <ContextMenu.Button key={key++} variant="primary" onClick={onRunSolution}>Run Solution</ContextMenu.Button>,
        <ContextMenu.Button key={key++} variant="primary" onClick={onOpenSolution}>Open Solution</ContextMenu.Button>,
        <ContextMenu.Button key={key++} variant="primary" onClick={onCopySolutionCopyUrl}>Copy Solution Clone URL</ContextMenu.Button>
    ]
}
