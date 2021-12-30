import { View } from "../View"
import { Monitor, Ref, Transaction, unobservable } from "reactronic"
import { OptionCategoriesExplorer, Options } from "../options"
import * as domain from "../../domain"

export class OptionsView extends View {
    @unobservable readonly optionCategoriesExplorer: OptionCategoriesExplorer
    @unobservable readonly options: Options
    
    override get sidePanelTitle(): string { return "Options" }
    get monitor(): Monitor | null { return null }

    constructor(id: string, options: Options, permissions: Ref<domain.Permissions>) {
        super(id)
        this.options = options
        this.optionCategoriesExplorer = new OptionCategoriesExplorer(permissions)
    }

    override dispose(): void {
        Transaction.run(() => {
            this.optionCategoriesExplorer.dispose()
            super.dispose()
        })
    }
}
