import { Explorer, ItemNode } from "../explorer"
import { Service } from "./service/Service"
import { reaction, Ref, unobservable } from "reactronic"

export class ServicesExplorer extends Explorer<Service, ItemNode<Service>> {
    @unobservable private readonly services: Ref<readonly Service[]>

    constructor(services: Ref<readonly Service[]>) {
        super(ServicesExplorer.createChildren(services.value))
        this.services = services
    }

    private static createChildren(services: readonly Service[]): ItemNode<Service>[] {
        return services.map(s => new ItemNode(s.name, s.name, s))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = ServicesExplorer.createChildren(this.services.observe())
        this.updateChildren(newChildren)
    }
}
