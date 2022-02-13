export class Preferences {
    static readonly default = Preferences.createDefaultPreferences()
    readonly id: number
    readonly darkMode: boolean

    constructor(id: number, darkMode: boolean) {
        this.id = id
        this.darkMode = darkMode
    }

    private static createDefaultPreferences(): Preferences { return new Preferences(0, false) }
}
