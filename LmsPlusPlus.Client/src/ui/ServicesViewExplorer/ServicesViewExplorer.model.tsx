import { Explorer } from "../Explorer"
import { IRenderer, ServiceView } from "../SolutionRunnerView"
import { RendererNode } from "./RendererNode.model"
import { ServiceViewNode } from "./ServiceViewNode.model"

export class ServiceViewsExplorer extends Explorer<IRenderer> {
    constructor(views: ServiceView[]) {
        super(ServiceViewsExplorer.createChildren(views))
        if (this.children.length > 0) {
            const viewNode = this.children[0] as ServiceViewNode
            if (viewNode.children && viewNode.children.length > 0) {
                viewNode.toggle()
                const rendererNode = viewNode.children[0] as RendererNode
                this.setSelectedNode(rendererNode)
            }
        }
    }

    private static createChildren(views: ServiceView[]): ServiceViewNode[] {
        return views.map(v => new ServiceViewNode(v))
    }
}
