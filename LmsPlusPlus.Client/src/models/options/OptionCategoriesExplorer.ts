import { reaction, Ref, Rx, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Explorer, ItemNode } from "../explorer"

export enum OptionCategory {
    Preferences,
    Vsc
}

export class OptionCategoriesExplorer extends Explorer<OptionCategory, ItemNode<OptionCategory>> {
    @unobservable private readonly _permissions: Ref<domain.Permissions>

    constructor(permissions: Ref<domain.Permissions>) {
        super(OptionCategoriesExplorer.createChildren(permissions.value))
        this._permissions = permissions
    }

    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this._permissions)
            super.dispose()
        })
    }

    private static createChildren(permissions: domain.Permissions): readonly ItemNode<OptionCategory>[] {
        const preferences = new ItemNode("Preferences", "0", OptionCategory.Preferences)
        const nodes = [preferences]
        if (permissions.canUpdateVcsConfiguration) {
            const vcs = new ItemNode("VCS", "1", OptionCategory.Vsc)
            nodes.push(vcs)
        }
        return nodes
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = OptionCategoriesExplorer.createChildren(this._permissions.value)
        this.updateChildren(newChildren)
    }
}