import { isnonreactive } from "reactronic"
import * as domain from "../../domain"
import { IContextMenuService } from "../ContextMenuService"
import { Node } from "../Explorer"
import { ISolutionsService } from "../ISolutionsService"
import * as view from "./SolutionNode.view"

export class SolutionNode extends Node<domain.Solution> {
    @isnonreactive readonly solutionsService: ISolutionsService

    override get contextMenuService(): IContextMenuService { return super.contextMenuService as IContextMenuService }

    constructor(solution: domain.Solution, contextMenuService: IContextMenuService, solutionsService: ISolutionsService) {
        super(solution.id.toString(), solution, `${solution.solver!.firstName} ${solution.solver!.lastName}`, contextMenuService)
        this.solutionsService = solutionsService
    }

    override renderContextMenuItems(): JSX.Element[] | null {
        return view.renderContextMenuItems(this)
    }
}
