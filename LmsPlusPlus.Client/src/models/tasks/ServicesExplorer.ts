import { Explorer, ItemNode } from "../explorer"
import * as services from "../../services"
import { reaction, Ref, unobservable } from "reactronic"

export class ServicesExplorer extends Explorer<services.Service, ItemNode<services.Service>> {
    @unobservable private readonly services: Ref<readonly services.Service[]>

    constructor(services: Ref<readonly services.Service[]>) {
        super(ServicesExplorer.createChildren(services.value))
        this.services = services
    }

    private static createChildren(services: readonly services.Service[]): ItemNode<services.Service>[] {
        return services.map(s => new ItemNode(s.name, s.name, s))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = ServicesExplorer.createChildren(this.services.observe())
        this.updateChildren(newChildren)
    }
}
