import { isnonreactive, reaction, Ref } from "reactronic"
import { ObservableObject } from "../ObservableObject"

export class ThemeService extends ObservableObject {
    @isnonreactive private readonly _theme: Ref<string>

    constructor(theme: Ref<string>) {
        super()
        this._theme = theme
    }

    @reaction
    private updateTheme(): void {
        switch (this._theme.value) {
        case "Dark":
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
            break
        case "Light":
            document.documentElement.style.setProperty("--background-primary", "#e9ecef")
            document.documentElement.style.setProperty("--background-secondary", "#2e3338")
            document.documentElement.style.setProperty("--background-secondary-hover", "#40474f")
            document.documentElement.style.setProperty("--text-primary", "#212529")
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
        default:
            break
        }
    }
}
