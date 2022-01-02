import { View } from "../View"
import { Monitor, Ref, Transaction, unobservable } from "reactronic"
import { OptionCategoriesExplorer, Options } from "../options"
import * as domain from "../../domain"

export class OptionsView extends View {
    @unobservable readonly optionCategoriesExplorer: OptionCategoriesExplorer
    @unobservable readonly options: Options
    
    override get sidePanelTitle(): string { return "Options" }

    constructor(id: string, options: Options, permissions: Ref<domain.Permissions>) {
        super(id)
        this.options = options
        this.optionCategoriesExplorer = new OptionCategoriesExplorer(permissions)
        this.optionCategoriesExplorer.setSelectedNode(this.optionCategoriesExplorer.children[0])
    }

    override dispose(): void {
        Transaction.run(() => {
            this.optionCategoriesExplorer.dispose()
            super.dispose()
        })
    }
}
