import { reaction, transaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Database } from "../database"
import { Options, OptionsView } from "./options"
import { TasksView } from "./tasks"

export type View = TasksView | OptionsView

export class App extends ObservableObject {
  @unobservable readonly tasksView: TasksView
  @unobservable readonly optionsView: OptionsView
  @unobservable readonly options: Options
  @unobservable private readonly database = new Database()
  private _activeView: View

  get activeView(): View { return this._activeView }

  constructor() {
    super()
    this.tasksView = new TasksView(this.database)
    this._activeView = this.tasksView
    this.options = new Options(this.database)
    this.optionsView = new OptionsView(this.options)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.tasksView.dispose()
      this.optionsView.dispose()
      this.options.dispose()
      this.database.dispose()
      super.dispose()
    })
  }

  @transaction
  setActiveView(view: View): void {
    this._activeView = view
  }

  @reaction
  private async createdTask_created_in_database(): Promise<void> {
    if (this.tasksView.createdTask)
      await this.database.createTask(this.tasksView.createdTask)
  }

  @reaction
  private async updatedTask_updated_in_database(): Promise<void> {
    if (this.tasksView.updatedTask)
      await this.database.updateTask(this.tasksView.updatedTask)
  }

  @reaction
  private async deletedTask_deleted_from_database(): Promise<void> {
    if (this.tasksView.deletedTask)
      await this.database.deleteTask(this.tasksView.deletedTask)
  }

  @reaction
  private async updatedPreferences_updated_in_database(): Promise<void> {
    if (this.options.updatedPreferences)
      await this.database.updatePreferences(this.options.updatedPreferences)
  }

  @reaction
  private async updatedVcsConfiguration_updated_in_database(): Promise<void> {
    if (this.options.updatedVcsConfiguration)
      await this.database.updateVcsConfiguration(this.options.updatedVcsConfiguration)
  }
}
