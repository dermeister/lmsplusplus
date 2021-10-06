import { transaction, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Explorer, GroupNode, ItemNode } from "../explorer"

export class DemoNode extends GroupNode {
  @unobservable readonly item: domain.Demo

  override get children(): readonly ItemNode<domain.Service>[] {
    return super.children as readonly ItemNode<domain.Service>[]
  }

  constructor(demo: domain.Demo) {
    super(demo.solution.name, `demo-${demo.id}`, DemoNode.createServiceNodes(demo))
    this.item = demo
  }

  private static createServiceNodes(demo: domain.Demo): ItemNode<domain.Service>[] {
    function createItemNode(service: domain.Service): ItemNode<domain.Service> {
      return new ItemNode(service.name, `service-${service.id}`, service)
    }

    return Transaction.run(() => demo.services.map(createItemNode))
  }
}

export class MultipleDemosExplorer extends Explorer<domain.Service> {
  override get children(): readonly DemoNode[] { return super.children as readonly DemoNode[] }
  get selectedService(): domain.Service | null { return this.selectedNode?.item ?? null }

  constructor(demos: readonly domain.Demo[]) {
    super(MultipleDemosExplorer.createDemoNodes(demos))
  }

  @transaction
  updateDemos(demos: readonly domain.Demo[]): void {
    this.updateExplorer(MultipleDemosExplorer.createDemoNodes(demos))
  }

  private static createDemoNodes(demos: readonly domain.Demo[]): GroupNode[] {
    return Transaction.run(() => demos.map(d => new DemoNode(d)))
  }
}

