import { isnonreactive } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Explorer } from "../Explorer"
import { ISolutionsService } from "../ISolutionsService"
import { GroupNode } from "./GroupNode.model"

export class SolutionsExplorer extends Explorer<domain.Solution> {
    @isnonreactive private readonly _solutionsService: ISolutionsService

    constructor(groups: readonly domain.Group[], solutions: readonly domain.Solution[], solutionsService: ISolutionsService,
        contextMenuService: IContextMenuService) {
        super(SolutionsExplorer.createGroupNodes(groups, solutions, solutionsService, contextMenuService))
        this._solutionsService = solutionsService
    }

    private static createGroupNodes(groups: readonly domain.Group[], solutions: readonly domain.Solution[], solutionsService: ISolutionsService,
        contextMenuService: IContextMenuService): readonly GroupNode[] {
        return groups.map(g => {
            const groupSolutions = solutions.filter(s => g.users.map(u => u.id).includes(s.solver!.id))
            return new GroupNode(g, groupSolutions, contextMenuService, solutionsService)
        })
    }
}
