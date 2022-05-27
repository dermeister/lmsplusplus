import { ServiceView } from "../SolutionRunnerView/ServiceView.model"
import { reaction, Ref, unobservable } from "reactronic"
import { Explorer, ItemNode } from "../../models"

export class ServicesExplorer extends Explorer<ServiceView, ItemNode<ServiceView>> {
    @unobservable private readonly _services: Ref<readonly ServiceView[]>

    constructor(services: Ref<readonly ServiceView[]>) {
        super(ServicesExplorer.createChildren(services.value), null!)
        this._services = services
    }

    private static createChildren(services: readonly ServiceView[]): readonly ItemNode<ServiceView>[] {
        return services.map(s => new ItemNode(s.name, s.name, s))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = ServicesExplorer.createChildren(this._services.value)
        this.updateChildren(newChildren)
    }
}
