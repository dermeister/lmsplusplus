import viewSwitchButtonIcon from "../assets/cog.svg"
import { DatabaseContext } from "../database"
import { IAuthService } from "./AuthService"
import { IOptionsService } from "./Options"
import { OptionsView } from "./OptionsView"
import { ViewGroup } from "./ViewGroup"

export class OptionsViewGroup extends ViewGroup {
  get iconUrl(): string { return viewSwitchButtonIcon }

  constructor(id: string, authSerivce: IAuthService, context: DatabaseContext, optionsService: IOptionsService) {
    super(id)
    const optionsView = new OptionsView("options", authSerivce, context, optionsService)
    this.openView(optionsView)
  }
}
