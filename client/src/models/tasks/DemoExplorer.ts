import { transaction, Transaction } from "reactronic"
import { Demo, Service } from "../../domain/Demo"
import { Explorer, GroupNode, ItemNode } from "../explorer"

export class DemoNode extends GroupNode {
  override get children(): readonly ItemNode<Service>[] {
    return super.children as readonly ItemNode<Service>[]
  }

  constructor(demo: Demo) {
    super(demo.solution.name, `demo-${demo.id}`, false, DemoNode.createServiceNodes(demo))
  }

  private static createServiceNodes(demo: Demo): ItemNode<Service>[] {
    function createItemNode(service: Service): ItemNode<Service> {
      return new ItemNode(service.name, `service-${service.id}`, false, service)
    }

    return Transaction.run(() => demo.services.map(createItemNode))
  }
}

export class DemoExplorer extends Explorer<Service> {
  override get children(): readonly DemoNode[] { return super.children as readonly DemoNode[] }
  get selectedService(): Service | null { return this.selectedNode?.item ?? null }

  constructor(demos: readonly Demo[]) {
    super(DemoExplorer.createDemoNodes(demos))
  }

  @transaction
  updateDemos(demos: readonly Demo[]): void {
    this.updateExplorer(DemoExplorer.createDemoNodes(demos))
  }

  private static createDemoNodes(demos: readonly Demo[]): GroupNode[] {
    return Transaction.run(() => demos.map(d => new DemoNode(d)))
  }
}
