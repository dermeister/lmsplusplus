import { Transaction, transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Explorer, ItemNode } from "../explorer"

export class SingleDemoExplorer extends Explorer<domain.Service> {
  @unobservable readonly demo: domain.Demo

  override get children(): readonly ItemNode<domain.Service>[] {
    return super.children as readonly ItemNode<domain.Service>[]
  }
  get selectedService(): domain.Service | null { return this.selectedNode?.item ?? null }

  constructor(demo: domain.Demo) {
    super(SingleDemoExplorer.createDemoNodes(demo))
    this.demo = demo
  }

  @transaction
  updateDemos(demos: domain.Demo): void {
    this.updateExplorer(SingleDemoExplorer.createDemoNodes(demos))
  }

  private static createDemoNodes(demo: domain.Demo): ItemNode<domain.Service>[] {
    function createItemNode(service: domain.Service): ItemNode<domain.Service> {
      return new ItemNode(service.name, `service-${service.id}`, service)
    }

    return Transaction.run(() => demo.services.map(createItemNode))
  }
}
