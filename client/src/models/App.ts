import { reaction, Transaction, unobservable } from "reactronic"
import { Database } from "../database"
import { ObservableObject } from "../ObservableObject"
import { Options, OptionsView } from "./options"
import { MainView } from "./tasks"
import { ViewGroup } from "./ViewGroup"

export class App extends ObservableObject {
  @unobservable readonly views: ViewGroup
  @unobservable readonly mainView: MainView
  @unobservable readonly optionsView: OptionsView
  @unobservable readonly options: Options
  @unobservable private readonly database = new Database()

  constructor() {
    super()
    this.mainView = new MainView(this.database)
    this.options = new Options(this.database)
    this.optionsView = new OptionsView(this.options)
    this.views = new ViewGroup([this.mainView, this.optionsView], this.mainView)
  }

  override dispose(): void {
    Transaction.run(() => {
      this.mainView.dispose()
      this.optionsView.dispose()
      this.options.dispose()
      this.database.dispose()
      super.dispose()
    })
  }

  @reaction
  private async createdTask_created_in_database(): Promise<void> {
    if (this.mainView.createdTask)
      await this.database.createTask(this.mainView.createdTask)
  }

  @reaction
  private async updatedTask_updated_in_database(): Promise<void> {
    if (this.mainView.updatedTask)
      await this.database.updateTask(this.mainView.updatedTask)
  }

  @reaction
  private async deletedTask_deleted_from_database(): Promise<void> {
    if (this.mainView.deletedTask)
      await this.database.deleteTask(this.mainView.deletedTask)
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
