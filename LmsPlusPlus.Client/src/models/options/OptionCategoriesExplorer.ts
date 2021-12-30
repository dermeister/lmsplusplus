import { reaction, Ref, Rx, standalone, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Explorer, ItemNode } from "../explorer"

export enum OptionCategory {
    Preferences,
    Vsc
}

export class OptionCategoriesExplorer extends Explorer<OptionCategory, ItemNode<OptionCategory>> {
    @unobservable private readonly permissions: Ref<domain.Permissions>

    constructor(permissions: Ref<domain.Permissions>) {
        super()
        this.permissions = permissions
    }

    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this.permissions)
            super.dispose()
        })
    }

    protected createChildren(): ItemNode<OptionCategory>[] {
        const preferences = new ItemNode("Preferences", "0", OptionCategory.Preferences)
        const nodes = [preferences]
        if (this.permissions.observe().canUpdateVcsConfiguration) {
            const vcs = new ItemNode("VCS", "1", OptionCategory.Vsc)
            nodes.push(vcs)
        }
        return nodes
    }

    @reaction
    private selectFirstCategory(): void {
        standalone(() => this.setSelectedNode(this.children[0]))
    }
}
