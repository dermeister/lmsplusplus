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
    @unobservable private readonly options: Options
    @unobservable private readonly views: Map<string, View>
    @unobservable private readonly database: Database
    private openedViewId: string

    get openedView(): View {
        if (!this.views.has(this.openedViewId))
            throw this.invalidViewIdError()
        return this.views.get(this.openedViewId) as View
    }
    get permissions(): domain.Permissions { return this.database.permissions }
    private get openedViewSidePanelTitle(): string { return this.openedView.sidePanelTitle }
    private get openedViewIsPerformingOperation(): boolean { return this.openedView.isPerformingOperation }

    constructor(database: Database) {
        super()
        this.database = database
        this.options = new Options(this.database)
        const tasksView = new TasksView(MainScreen.TASKS_VIEW_ID, this.database)
        const optionsView = new OptionsView(MainScreen.OPTIONS_VIEW_ID, this.options, new Ref(this.database, "permissions"))
        this.views = MainScreen.createViewMap([tasksView, optionsView])
        this.openedViewId = tasksView.id
        const title = new Ref(this, "openedViewSidePanelTitle")
        const isPulsing = new Ref(this, "openedViewIsPerformingOperation")
        this.sidePanel = new SidePanel(title, isPulsing)
    }

    override dispose(): void {
        Transaction.run(() => {
            this.views.forEach(v => v.dispose())
            this.views.toMutable().clear()
            this.options.dispose()
            this.sidePanel.dispose()
            super.dispose()
        })
    }

    @transaction
    toggleView(id: string): void {
        if (id !== this.openedViewId) {
            if (!this.views.has(id))
                throw this.invalidViewIdError()
            this.openedViewId = id
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
        return new Error(`Invalid option id: ${this.openedViewId}`)
    }
}
