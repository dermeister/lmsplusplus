import { transaction, Transaction } from "reactronic"
import * as domain from "../../domain"
import { Explorer, ItemNode } from "../explorer"

export enum OptionCategory {
  Vsc,
  Preferences
}

export class OptionCategories extends Explorer<OptionCategory> {
  constructor(permissions: domain.Permissions) {
    super(OptionCategories.createNodes(permissions))
    this.setSelectedNode(this.children[0])
  }

  get selectedCategory(): OptionCategory { return this.selectedNode?.item as OptionCategory }
  override get children(): readonly ItemNode<OptionCategory>[] {
    return super.children as readonly ItemNode<OptionCategory>[]
  }

  override setSelectedNode(node: ItemNode<OptionCategory>): void {
    super.setSelectedNode(node)
  }

  @transaction
  updatePermissions(permissions: domain.Permissions): void {
    this.updateExplorer(OptionCategories.createNodes(permissions))
  }

  private static createNodes(permissions: domain.Permissions): ItemNode<OptionCategory>[] {
    return Transaction.run(() => {
      const preferences = new ItemNode("Preferences", "1", OptionCategory.Preferences)
      const nodes = [preferences]
      if (permissions.canUpdateVcsConfiguration) {
        const vcs = new ItemNode("VCS", "0", OptionCategory.Vsc)
        nodes.push(vcs)
      }
      return nodes
    })
  }
}
