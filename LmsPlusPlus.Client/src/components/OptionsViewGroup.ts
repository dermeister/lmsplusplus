import viewSwitchButtonIcon from "../assets/cog.svg"
import { DatabaseContext } from "../database"
import { IAuthService } from "./AuthService"
import { IMessageService } from "./MessageService"
import { OptionsView } from "./OptionsView"
import { ViewGroup } from "./ViewGroup"

export class OptionsViewGroup extends ViewGroup {
    get iconUrl(): string { return viewSwitchButtonIcon }

    constructor(id: string, authSerivce: IAuthService, context: DatabaseContext, messageService: IMessageService) {
        super(id)
        const optionsView = new OptionsView(authSerivce, context, messageService)
        this.openView(optionsView)
    }
}
