import viewSwitchButtonIcon from "../assets/cog.svg";
import { IAuthService } from "./AuthService";
import { OptionsView } from "./OptionsView";
import { ViewGroup } from "./ViewGroup";

export class OptionsViewGroup extends ViewGroup {
  get iconUrl(): string { return viewSwitchButtonIcon }

  constructor(id: string, authSerivce: IAuthService) {
    super(id)
    const optionsView = new OptionsView("options", authSerivce)
    this.openView(optionsView)
  }
}
