import { reaction, Ref, Rx, Transaction, isnonreactive } from "reactronic"
import * as domain from "../../domain"
import { Explorer, Node } from "../Explorer"

export enum OptionCategoryKind {
    Preferences,
    Vcs
}

export class OptionCategoriesExplorer extends Explorer<OptionCategoryKind> {
    @isnonreactive private readonly _permissions: Ref<domain.Permissions>

    constructor(permissions: Ref<domain.Permissions>) {
        super(OptionCategoriesExplorer.createChildren(permissions.value))
        this._permissions = permissions
        if (this.children.length > 0)
            this.setSelectedNode(this.children[0] as Node<OptionCategoryKind>)
    }

    override dispose(): void {
        Transaction.run(null, () => {
            Rx.dispose(this._permissions)
            super.dispose()
        })
    }

    private static createChildren(permissions: domain.Permissions): readonly Node<OptionCategoryKind>[] {
        const preferences = new Node<OptionCategoryKind>("0", OptionCategoryKind.Preferences, "Preferences")
        const nodes = [preferences]
        if (permissions.hasVcsAccounts) {
            const vcs = new Node<OptionCategoryKind>("1", OptionCategoryKind.Vcs, "VCS")
            nodes.push(vcs)
        }
        return nodes
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = OptionCategoriesExplorer.createChildren(this._permissions.value)
        this.updateChildren(newChildren)
        if (!this.selectedNode && this.children.length > 0)
            this.setSelectedNode(this.children[0] as Node<OptionCategoryKind>)
    }
}
