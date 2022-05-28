import { Node } from "../Explorer"
import { ServiceView } from "../SolutionRunnerView"
import { RendererNode } from "./RendererNode.model"

export class ServiceViewNode extends Node<ServiceView> {
    constructor(view: ServiceView) {
        super(view.name, view, view.name, null, ServiceViewNode.createChildren(view))
    }

    private static createChildren(view: ServiceView): RendererNode[] {
        return view.renderers.map(r => new RendererNode(r))
    }
}
