import { reaction, Ref, Rx, Transaction, unobservable } from "reactronic"
import * as domain from "../../domain"
import { Explorer, Node } from "../Explorer"

export enum OptionCategoryKind {
    Preferences,
    Vcs
}

export class OptionCategoriesExplorerModel extends Explorer<OptionCategoryKind> {
    @unobservable private readonly _permissions: Ref<domain.Permissions>
    override get children(): readonly Node<OptionCategoryKind>[] { return super.children as readonly Node<OptionCategoryKind>[] }

    constructor(permissions: Ref<domain.Permissions>) {
        super(OptionCategoriesExplorerModel.createChildren(permissions.value))
        this._permissions = permissions
        this.setSelectedNode(this.children[0])
    }

    override dispose(): void {
        Transaction.run(() => {
            Rx.dispose(this._permissions)
            super.dispose()
        })
    }

    private static createChildren(permissions: domain.Permissions): readonly Node<OptionCategoryKind>[] {
        const preferences = new Node<OptionCategoryKind>("0", OptionCategoryKind.Preferences, "Preferences")
        const nodes = [preferences]
        if (permissions.canUpdateVcsConfiguration) {
            const vcs = new Node<OptionCategoryKind>("1", OptionCategoryKind.Vcs, "VCS")
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
