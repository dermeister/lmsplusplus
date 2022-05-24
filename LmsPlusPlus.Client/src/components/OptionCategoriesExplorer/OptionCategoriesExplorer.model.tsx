import { reaction, Ref, Rx, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import React from "react"
import { Explorer, ItemNode } from "../../models"
import { OptionCategoriesExplorerView } from "./OptionCategoriesExplorer.view"

export enum OptionCategoryKind {
    Preferences,
    Vcs
}

export class OptionCategoriesExplorerModel extends Explorer<OptionCategoryKind, ItemNode<OptionCategoryKind>> {
    @unobservable private readonly _permissions: Ref<domain.Permissions>

    constructor(permissions: Ref<domain.Permissions>) {
        super(OptionCategoriesExplorerModel.createChildren(permissions.value), null!)
        this._permissions = permissions
        this.setSelectedNode(this.children[0])
    }

    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this._permissions)
            super.dispose()
        })
    }

    render(): JSX.Element {
        return <OptionCategoriesExplorerView model={this} />
    }

    private static createChildren(permissions: domain.Permissions): readonly ItemNode<OptionCategoryKind>[] {
        const preferences = new ItemNode("Preferences", "0", OptionCategoryKind.Preferences)
        const nodes = [preferences]
        if (permissions.canUpdateVcsConfiguration) {
            const vcs = new ItemNode("VCS", "1", OptionCategoryKind.Vcs)
            nodes.push(vcs)
        }
        return nodes
    }

    @reaction
    private updateExplorer(): void {
        const newChildren = OptionCategoriesExplorerModel.createChildren(this._permissions.value)
        this.updateChildren(newChildren)
    }
}
