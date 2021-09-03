import { Transaction, unobservable } from "reactronic"
import { SidePanel } from "../SidePanel"
import { View } from "../View"
import { ViewGroup } from "../ViewGroup"
import { OptionCategories } from "./OptionCategories"
import { Options } from "./Options"

export class OptionsView extends View {
  @unobservable readonly categories = new OptionCategories()
  @unobservable readonly options: Options
  @unobservable readonly views = new ViewGroup([this], this)
  @unobservable readonly sidePanel = new SidePanel("Options")

  constructor(options: Options, key: string) {
    super("Options", key)
    this.options = options
  }

  override dispose(): void {
    Transaction.run(() => {
      this.categories.dispose()
      this.views.dispose()
      this.sidePanel.dispose()
      super.dispose()
    })
  }
}
