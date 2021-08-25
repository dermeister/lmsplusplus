import { Transaction } from "reactronic"
import { Disposable } from "../../Disposable"
import { Options } from "./Options"
import { SidePanel } from "../SidePanel"
import { OptionCategories } from "./OptionCategories"

export class OptionsView implements Disposable {
  readonly leftPanel = new SidePanel("Options")
  readonly categories = new OptionCategories()
  readonly options: Options

  constructor(options: Options) { this.options = options }

  dispose(): void {
    Transaction.run(() => {
      this.leftPanel.dispose()
      this.categories.dispose()
    })
  }
}
