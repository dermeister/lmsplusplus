import { Transaction } from "reactronic"
import { Explorer, ItemNode } from "../explorer"

export enum OptionCategory {
  Vsc,
  Preferences
}

export class OptionCategories extends Explorer<OptionCategory> {
  private static readonly nodes = OptionCategories.createNodes()

  constructor() {
    super(OptionCategories.nodes)
    this.setSelectedNode(OptionCategories.nodes[0])
  }

  get selectedCategory(): OptionCategory { return this.selectedNode?.item as OptionCategory }
  override get children(): readonly ItemNode<OptionCategory>[] {
    return super.children as readonly ItemNode<OptionCategory>[]
  }

  override setSelectedNode(node: ItemNode<OptionCategory>): void {
    super.setSelectedNode(node)
  }

  private static createNodes(): ItemNode<OptionCategory>[] {
    return Transaction.run(() => {
      const vcs = new ItemNode("VCS", "0", false, OptionCategory.Vsc)
      const preferences = new ItemNode("Preferences", "1", false, OptionCategory.Preferences)
      return [vcs, preferences]
    })
  }
}
