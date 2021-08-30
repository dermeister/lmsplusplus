import { Transaction } from "reactronic"
import { Disposable } from "../../Disposable"
import { SidePanel } from "../SidePanelGroup"
import { Side, SidePanelGroup } from "../SidePanelGroup"
import { OptionCategories } from "./OptionCategories"
import { Options } from "./Options"

export class OptionsView implements Disposable {
  readonly leftPanelGroup: SidePanelGroup
  readonly leftPanel = new SidePanel("Options")
  readonly categories = new OptionCategories()
  readonly options: Options

  constructor(options: Options) {
    this.options = options
    this.leftPanelGroup = new SidePanelGroup([this.leftPanel], this.leftPanel, true, Side.Left)
  }

  dispose(): void {
    Transaction.run(() => {
      this.categories.dispose()
    })
  }
}
