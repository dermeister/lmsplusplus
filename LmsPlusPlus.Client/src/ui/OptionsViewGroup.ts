import { Storage, IAuthService } from "../api"
import viewSwitchButtonIcon from "../assets/cog.svg"
import { IMessageService } from "./MessageService"
import { OptionsView } from "./OptionsView"
import { ViewGroup } from "./ViewGroup"

export class OptionsViewGroup extends ViewGroup {
    get iconUrl(): string { return viewSwitchButtonIcon }

    constructor(id: string, authSerivce: IAuthService, storage: Storage, messageService: IMessageService) {
        super(id)
        const optionsView = new OptionsView(authSerivce, storage, messageService)
        this.openView(optionsView)
    }
}
