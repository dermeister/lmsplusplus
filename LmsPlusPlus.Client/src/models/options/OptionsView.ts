import { reaction, Transaction, unobservable } from "reactronic"
import { ReadOnlyDatabase } from "../../database"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { OptionCategories } from "./OptionCategories"
import { Options } from "./Options"

export class OptionsView extends View {
  @unobservable readonly categories: OptionCategories
  @unobservable readonly options: Options
  @unobservable readonly viewGroup = new ViewGroup([this], this)
  @unobservable readonly sidePanel = new SidePanel("Options")
  @unobservable readonly database: ReadOnlyDatabase

  constructor(options: Options, key: string, database: ReadOnlyDatabase) {
    super("Options", key)
    this.options = options
    this.database = database
    this.categories = new OptionCategories(this.database.permissions)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.categories.dispose()
      this.viewGroup.dispose()
      this.sidePanel.dispose()
      super.dispose()
    })
  }

  @reaction
  private options_categories_synchronized_with_permissions(): void {
    this.categories.updatePermissions(this.database.permissions)
  }
}
