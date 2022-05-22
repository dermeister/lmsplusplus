import viewSwitchButtonIcon from "../assets/cog.svg"
import { DatabaseContext } from "../database";
import { IViewService } from "./IViewService";
import { OptionsView } from "./OptionsView";
import { ViewGroup } from "./ViewGroup";

export class OptionsViewGroup extends ViewGroup {
  get iconUrl(): string { return viewSwitchButtonIcon }

  constructor(id: string) {
    super(id)
    const optionsView = new OptionsView("options")
    this.openView(optionsView)
  }
}
