import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ISolutionsService } from "../ISolutionsService"
import { SolutionNode } from "./SolutionNode.model"

export class GroupNode extends Node<domain.Group> {
    constructor(group: domain.Group, solutions: readonly domain.Solution[], contextMenuService: IContextMenuService, solutionsService: ISolutionsService) {
        super(group.id.toString(), group, group.name, null, GroupNode.createSolutionNodes(solutions, contextMenuService, solutionsService))
    }

    private static createSolutionNodes(solutions: readonly domain.Solution[], contextMenuService: IContextMenuService,
        solutionsService: ISolutionsService): readonly SolutionNode[] {
        return solutions.map(s => new SolutionNode(s, contextMenuService, solutionsService))
    }
}
