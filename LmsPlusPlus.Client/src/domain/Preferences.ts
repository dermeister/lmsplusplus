export class Preferences {
    static readonly default = Preferences.createDefaultPreferences()
    readonly darkMode: boolean

    constructor(darkMode: boolean) { this.darkMode = darkMode }

    private static createDefaultPreferences(): Preferences { return new Preferences(false) }
}
