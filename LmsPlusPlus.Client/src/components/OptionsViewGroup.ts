import viewSwitchButtonIcon from "../assets/cog.svg"
import { DatabaseContext } from "../database"
import { IAuthService } from "./AuthService"
import { IErrorService } from "./ErrorService"
import { OptionsView } from "./OptionsView"
import { ViewGroup } from "./ViewGroup"

export class OptionsViewGroup extends ViewGroup {
    get iconUrl(): string { return viewSwitchButtonIcon }

    constructor(id: string, authSerivce: IAuthService, context: DatabaseContext, errorService: IErrorService) {
        super(id)
        const optionsView = new OptionsView(authSerivce, context, errorService)
        this.openView(optionsView)
    }
}
