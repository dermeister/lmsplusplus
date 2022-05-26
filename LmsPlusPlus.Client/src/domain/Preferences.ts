export class Preferences {
    static readonly default = Preferences.createDefaultPreferences()
    readonly theme: string

    constructor(darkMode: string) {
        this.theme = darkMode
    }

    private static createDefaultPreferences(): Preferences { return new Preferences("Dark") }
}
