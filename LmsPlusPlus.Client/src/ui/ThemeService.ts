import { isnonreactive, reaction, Ref } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import arrowRightLightIcon from "../assets/chevron-right-light.svg"
import arrowRightDarkIcon from "../assets/chevron-right-dark.svg"
import arrowDownLightIcon from "../assets/chevron-down-light.svg"
import arrowDownDarkIcon from "../assets/chevron-down-dark.svg"
import plusLightIcon from "../assets/plus-light.svg"
import plusDarkIcon from "../assets/plus-dark.svg"
import plusHoveredLightIcon from "../assets/plus-hovered-light.svg"
import plusHoveredDarkIcon from "../assets/plus-hovered-dark.svg"
import errorLightIcon from "../assets/error-light.svg"
import errorDarkIcon from "../assets/error-dark.svg"
import closeLightIcon from "../assets/close-light.svg"
import closeDarkIcon from "../assets/close-dark.svg"
import closeHoveredLightIcon from "../assets/close-hovered-light.svg"
import closeHoveredDarkIcon from "../assets/close-hovered-dark.svg"
import checkLightIcon from "../assets/check-light.svg"
import checkDark from "../assets/check-dark.svg"
import trashDangerLightIcon from "../assets/trash-danger-light.svg"
import trashDangerDarkIcon from "../assets/trash-danger-dark.svg"
import trashDangerHoveredLightIcon from "../assets/trash-danger-hovered-light.svg"
import trashDangerHoveredDarkIcon from "../assets/trash-danger-hovered-dark.svg"

export interface IThemeService {
    readonly theme: string
}

export class ThemeService extends ObservableObject implements IThemeService {
    @isnonreactive private readonly _theme: Ref<string>

    get theme(): string { return this._theme.value }

    constructor(theme: Ref<string>) {
        super()
        this._theme = theme
    }

    @reaction
    private updateTheme(): void {
        switch (this._theme.value) {
            case "Dark":
                document.documentElement.style.colorScheme = "dark"
                document.documentElement.style.setProperty("--background-primary", "#212529")
                document.documentElement.style.setProperty("--background-secondary", "#2e3338")
                document.documentElement.style.setProperty("--background-secondary-hover", "#40474f")
                document.documentElement.style.setProperty("--text-primary", "#e9ecef")
                document.documentElement.style.setProperty("--text-primary-hover", "#ffffff")
                document.documentElement.style.setProperty("--text-secondary", "#e9ecef")
                document.documentElement.style.setProperty("--text-secondary-hover", "#ffffff")
                document.documentElement.style.setProperty("--primary", "#167cca")
                document.documentElement.style.setProperty("--primary-hover", "#1887dc")
                document.documentElement.style.setProperty("--secondary", "#495057")
                document.documentElement.style.setProperty("--secondary-hover", "#545c64")
                document.documentElement.style.setProperty("--danger", "#cb1b16")
                document.documentElement.style.setProperty("--danger-hover", "#dc1f18")
                document.documentElement.style.setProperty("--shadow-primary", "#090a0b")
                document.documentElement.style.setProperty("--shadow-secondary", "#1c1f22")
                document.documentElement.style.setProperty("--arrow-right-icon-url", `url(${arrowRightDarkIcon})`)
                document.documentElement.style.setProperty("--arrow-down-icon-url", `url(${arrowDownDarkIcon})`)
                document.documentElement.style.setProperty("--plus-icon-url", `url(${plusDarkIcon})`)
                document.documentElement.style.setProperty("--plus-hovered-icon-url", `url(${plusHoveredDarkIcon})`)
                document.documentElement.style.setProperty("--error-icon-url", `url(${errorDarkIcon})`)
                document.documentElement.style.setProperty("--close-icon-url", `url(${closeDarkIcon})`)
                document.documentElement.style.setProperty("--close-hovered-icon-url", `url(${closeHoveredDarkIcon})`)
                document.documentElement.style.setProperty("--check-icon-url", `url(${checkDark})`)
                document.documentElement.style.setProperty("--trash-danger-icon-url", `url(${trashDangerDarkIcon})`)
                document.documentElement.style.setProperty("--trash-danger-hovered-icon-url", `url(${trashDangerHoveredDarkIcon})`)
                break
            case "Light":
                document.documentElement.style.colorScheme = "light"
                document.documentElement.style.setProperty("--background-primary", "#FEFDF9")
                document.documentElement.style.setProperty("--background-secondary", "#F3E8E0")
                document.documentElement.style.setProperty("--background-secondary-hover", "#40474f")
                document.documentElement.style.setProperty("--text-primary", "#2e3338")
                document.documentElement.style.setProperty("--text-primary-hover", "#40474f")
                document.documentElement.style.setProperty("--text-secondary", "#2e3338")
                document.documentElement.style.setProperty("--text-secondary-hover", "#40474f")
                document.documentElement.style.setProperty("--primary", "#8fb996")
                document.documentElement.style.setProperty("--primary-hover", "#a1cca5")
                document.documentElement.style.setProperty("--secondary", "#d6ccc2")
                document.documentElement.style.setProperty("--secondary-hover", "#e3d5ca")
                document.documentElement.style.setProperty("--danger", "#ff758f")
                document.documentElement.style.setProperty("--danger-hover", "#ff8fa3")
                document.documentElement.style.setProperty("--shadow-primary", "#e6cebe")
                document.documentElement.style.setProperty("--shadow-secondary", "#debfac")
                document.documentElement.style.setProperty("--arrow-right-icon-url", `url(${arrowRightLightIcon})`)
                document.documentElement.style.setProperty("--arrow-down-icon-url", `url(${arrowDownLightIcon})`)
                document.documentElement.style.setProperty("--plus-icon-url", `url(${plusLightIcon})`)
                document.documentElement.style.setProperty("--plus-hovered-icon-url", `url(${plusHoveredLightIcon})`)
                document.documentElement.style.setProperty("--error-icon-url", `url(${errorLightIcon})`)
                document.documentElement.style.setProperty("--close-icon-url", `url(${closeLightIcon})`)
                document.documentElement.style.setProperty("--close-hovered-icon-url", `url(${closeHoveredLightIcon})`)
                document.documentElement.style.setProperty("--check-icon-url", `url(${checkLightIcon})`)
                document.documentElement.style.setProperty("--trash-danger-icon-url", `url(${trashDangerLightIcon})`)
                document.documentElement.style.setProperty("--trash-danger-hovered-icon-url", `url(${trashDangerHoveredLightIcon})`)
            default:
                break
        }
    }
}
