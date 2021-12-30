import { reaction, Ref, Rx, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Explorer, ItemNode } from "../explorer"

export enum OptionCategory {
    Preferences,
    Vsc
}

export class OptionCategoriesExplorer extends Explorer<OptionCategory> {
    @unobservable private readonly permissions: Ref<domain.Permissions>

    constructor(permissions: Ref<domain.Permissions>) {
        super(OptionCategoriesExplorer.createNodes(permissions.value))
        this.permissions = permissions
        this.setSelectedNode(this.children[0])
    }

    get selectedCategory(): OptionCategory { return this.selectedNode?.item as OptionCategory }
    override get children(): readonly ItemNode<OptionCategory>[] {
        return super.children as readonly ItemNode<OptionCategory>[]
    }

    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this.permissions)
            super.dispose()
        })
    }

    override setSelectedNode(node: ItemNode<OptionCategory>): void {
        super.setSelectedNode(node)
    }

    private static createNodes(permissions: domain.Permissions): ItemNode<OptionCategory>[] {
        return Transaction.run(() => {
            const preferences = new ItemNode("Preferences", "0", OptionCategory.Preferences)
            const nodes = [preferences]
            if (permissions.canUpdateVcsConfiguration) {
                const vcs = new ItemNode("VCS", "1", OptionCategory.Vsc)
                nodes.push(vcs)
            }
            return nodes
        })
    }

    @reaction
    private updatePermissions(): void {
        this.updateExplorer(OptionCategoriesExplorer.createNodes(this.permissions.observe()))
    }
}
