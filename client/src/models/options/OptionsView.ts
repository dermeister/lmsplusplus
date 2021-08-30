import { Disposable } from "../../Disposable"
import { PanelGroup, Side } from "../PanelGroup"
import { OptionCategories } from "./OptionCategories"
import { Options } from "./Options"

export class OptionsView implements Disposable {
  readonly leftPanelGroup: PanelGroup
  readonly categories = new OptionCategories()
  readonly options: Options

  constructor(options: Options) {
    this.options = options
    this.leftPanelGroup = new PanelGroup(["options"], "options", Side.Left)
  }

  dispose(): void {
    this.categories.dispose()
  }
}
