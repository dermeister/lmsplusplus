import { isnonreactive } from "reactronic"
import { IAuthService, Storage } from "../api"
import viewSwitchButtonLightIcon from "../assets/cog-light.svg"
import viewSwitchButtonDarkIcon from "../assets/cog-dark.svg"
import { IMessageService } from "./MessageService"
import { OptionsView } from "./OptionsView"
import { IThemeService } from "./ThemeService"
import { ViewGroup } from "./ViewGroup"

export class OptionsViewGroup extends ViewGroup {
    @isnonreactive private readonly _themeService: IThemeService

    get iconUrl(): string { return this._themeService.theme === "Dark" ? viewSwitchButtonDarkIcon : viewSwitchButtonLightIcon }

    constructor(id: string, authSerivce: IAuthService, storage: Storage, messageService: IMessageService, themeService: IThemeService) {
        super(id)
        this._themeService = themeService
        const optionsView = new OptionsView(authSerivce, storage, messageService)
        this.openView(optionsView)
    }
}
