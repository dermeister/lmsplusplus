import { transaction, Transaction, unobservable } from "reactronic"
import { Demo, Service } from "../../domain/Demo"
import { Explorer, GroupNode, ItemNode } from "../explorer"

export class DemoNode extends GroupNode {
  @unobservable readonly item: Demo

  override get children(): readonly ItemNode<Service>[] {
    return super.children as readonly ItemNode<Service>[]
  }

  constructor(demo: Demo) {
    super(demo.solution.name, `demo-${demo.id}`, true, DemoNode.createServiceNodes(demo))
    this.item = demo
  }

  private static createServiceNodes(demo: Demo): ItemNode<Service>[] {
    function createItemNode(service: Service): ItemNode<Service> {
      return new ItemNode(service.name, `service-${service.id}`, false, service)
    }

    return Transaction.run(() => demo.services.map(createItemNode))
  }
}

export class MultipleDemosExplorer extends Explorer<Service> {
  override get children(): readonly DemoNode[] { return super.children as readonly DemoNode[] }
  get selectedService(): Service | null { return this.selectedNode?.item ?? null }

  constructor(demos: readonly Demo[]) {
    super(MultipleDemosExplorer.createDemoNodes(demos))
  }

  @transaction
  updateDemos(demos: readonly Demo[]): void {
    this.updateExplorer(MultipleDemosExplorer.createDemoNodes(demos))
  }

  private static createDemoNodes(demos: readonly Demo[]): GroupNode[] {
    return Transaction.run(() => demos.map(d => new DemoNode(d)))
  }
}

