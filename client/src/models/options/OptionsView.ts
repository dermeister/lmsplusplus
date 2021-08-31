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

  constructor(options: Options) {
    super("Options")
    this.options = options
  }

  override dispose(): void {
    Transaction.run(() => {
      this.categories.dispose()
      super.dispose()
    })
  }
}
