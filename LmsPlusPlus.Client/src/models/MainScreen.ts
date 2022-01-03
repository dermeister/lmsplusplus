import { Screen } from "./Screen"
import { Ref, transaction, Transaction, unobservable } from "reactronic"
import { SidePanel } from "./SidePanel"
import { Options } from "./options"
import { Database } from "../database"
import { View } from "./View"
import { TasksView } from "./tasks"
import { OptionsView } from "./options"
import * as domain from "../domain"

export class MainScreen extends Screen {
    static readonly TASKS_VIEW_ID = "tasks"
    static readonly OPTIONS_VIEW_ID = "options"
    @unobservable readonly sidePanel: SidePanel
    @unobservable private readonly _options: Options
    @unobservable private readonly _views: Map<string, View>
    @unobservable private readonly _database: Database
    private _openedViewId: string

    get openedView(): View {
        if (!this._views.has(this._openedViewId))
            throw this.invalidViewIdError()
        return this._views.get(this._openedViewId) as View
    }
    get permissions(): domain.Permissions { return this._database.permissions }
    private get openedViewSidePanelTitle(): string { return this.openedView.sidePanelTitle }
    private get openedViewIsPerformingOperation(): boolean { return this.openedView.isPerformingOperation }

    constructor(database: Database) {
        super()
        this._database = database
        this._options = new Options(this._database)
        const tasksView = new TasksView(MainScreen.TASKS_VIEW_ID, this._database)
        const optionsView = new OptionsView(MainScreen.OPTIONS_VIEW_ID, this._options, new Ref(this._database, "permissions"))
        this._views = MainScreen.createViewMap([tasksView, optionsView])
        this._openedViewId = tasksView.id
        const title = new Ref(this, "openedViewSidePanelTitle")
        const isPulsing = new Ref(this, "openedViewIsPerformingOperation")
        this.sidePanel = new SidePanel(title, isPulsing)
    }

    override dispose(): void {
        Transaction.run(() => {
            this._views.forEach(v => v.dispose())
            this._views.toMutable().clear()
            this._options.dispose()
            this.sidePanel.dispose()
            super.dispose()
        })
    }

    @transaction
    toggleView(id: string): void {
        if (id !== this._openedViewId) {
            if (!this._views.has(id))
                throw this.invalidViewIdError()
            this._openedViewId = id
            this.sidePanel.open()
        } else
            this.sidePanel.toggle()
    }

    private static createViewMap(views: View[]): Map<string, View> {
        const result = new Map<string, View>()
        for (const view of views)
            result.set(view.id, view)
        return result
    }

    private invalidViewIdError(): Error {
        return new Error(`Invalid option id: ${this._openedViewId}`)
    }
}
