import { reaction, Transaction, unobservable } from "reactronic"
import { Database, ReadOnlyDatabase } from "../database"
import { ObservableObject } from "../ObservableObject"
import { Options, OptionsView } from "./options"
import { TasksView } from "./tasks"
import { ViewGroup } from "./ViewGroup"

export class App extends ObservableObject {
  @unobservable readonly viewGroup: ViewGroup
  @unobservable readonly tasksView: TasksView
  @unobservable readonly optionsView: OptionsView
  @unobservable readonly options: Options
  @unobservable private readonly _database = new Database()

  constructor() {
    super()
    this.tasksView = new TasksView(this._database, "Tasks")
    this.options = new Options(this._database)
    this.optionsView = new OptionsView(this.options, "Options", this._database)
    this.viewGroup = new ViewGroup([this.tasksView, this.optionsView], this.tasksView)
  }

  get database(): ReadOnlyDatabase { return this._database }

  override dispose(): void {
    Transaction.run(() => {
      this.viewGroup.dispose()
      this.tasksView.dispose()
      this.optionsView.dispose()
      this.options.dispose()
      this._database.dispose()
      super.dispose()
    })
  }

  @reaction
  private async createdTask_created_in_database(): Promise<void> {
    if (this.tasksView.createdTask)
      await this._database.createTask(this.tasksView.createdTask)
  }

  @reaction
  private async updatedTask_updated_in_database(): Promise<void> {
    if (this.tasksView.updatedTask)
      await this._database.updateTask(this.tasksView.updatedTask)
  }

  @reaction
  private async deletedTask_deleted_from_database(): Promise<void> {
    if (this.tasksView.deletedTask)
      await this._database.deleteTask(this.tasksView.deletedTask)
  }

  @reaction
  private async updatedPreferences_updated_in_database(): Promise<void> {
    if (this.options.updatedPreferences)
      await this._database.updatePreferences(this.options.updatedPreferences)
  }

  @reaction
  private async updatedVcsConfiguration_updated_in_database(): Promise<void> {
    if (this.options.updatedVcsConfiguration)
      await this._database.updateVcsConfiguration(this.options.updatedVcsConfiguration)
  }
}
