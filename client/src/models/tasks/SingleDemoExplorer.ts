import { Transaction, transaction, unobservable } from "reactronic"
import { Demo, Service } from "../../domain/Demo"
import { Explorer, ItemNode } from "../explorer"

export class SingleDemoExplorer extends Explorer<Service> {
  @unobservable readonly demo: Demo

  override get children(): readonly ItemNode<Service>[] {
    return super.children as readonly ItemNode<Service>[]
  }
  get selectedService(): Service | null { return this.selectedNode?.item ?? null }

  constructor(demo: Demo) {
    super(SingleDemoExplorer.createDemoNodes(demo))
    this.demo = demo
  }

  @transaction
  updateDemos(demos: Demo): void {
    this.updateExplorer(SingleDemoExplorer.createDemoNodes(demos))
  }

  private static createDemoNodes(demo: Demo): ItemNode<Service>[] {
    function createItemNode(service: Service): ItemNode<Service> {
      return new ItemNode(service.name, `service-${service.id}`, false, service)
    }

    return Transaction.run(() => demo.services.map(createItemNode))
  }
}
