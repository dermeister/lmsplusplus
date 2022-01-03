import { Explorer, ItemNode } from "../explorer"
import { Service } from "./service/Service"
import { reaction, Ref, unobservable } from "reactronic"

export class ServicesExplorer extends Explorer<Service, ItemNode<Service>> {
    @unobservable private readonly _services: Ref<readonly Service[]>

    constructor(services: Ref<readonly Service[]>) {
        super(ServicesExplorer.createChildren(services.value))
        this._services = services
    }

    private static createChildren(services: readonly Service[]): readonly ItemNode<Service>[] {
        return services.map(s => new ItemNode(s.name, s.name, s))
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = ServicesExplorer.createChildren(this._services.value)
        this.updateChildren(newChildren)
    }
}