import { reaction, transaction, Transaction, unobservable } from "reactronic"
import { ObservableObject } from "../ObservableObject"
import { Database } from "../repositories"
import { DemoView } from "./demo"
import { Options, OptionsView } from "./options"
import { SolutionsView } from "./solutions"
import { TasksView } from "./tasks"

export type View = TasksView | DemoView | SolutionsView | OptionsView

export class App extends ObservableObject {
  @unobservable readonly tasksView: TasksView
  @unobservable readonly solutionsView = new SolutionsView()
  @unobservable readonly demoView = new DemoView(null)
  @unobservable readonly optionsView: OptionsView
  @unobservable readonly options: Options
  @unobservable private readonly database = new Database()
  private _activeView: View

  get activeView(): View { return this._activeView }

  constructor() {
    super()
    this.tasksView = new TasksView(this.database.courses)
    this.options = new Options(this.database.preferences, this.database.vcsConfiguration)
    this.optionsView = new OptionsView(this.options)
    this._activeView = this.tasksView
  }

  override dispose(): void {
    Transaction.run(() => {
      this.tasksView.dispose()
      this.solutionsView.dispose()
      this.demoView.dispose()
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
  private tasksView_synchronized_with_courses(): void {
    this.tasksView.update(this.database.courses)
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
  private async demoView_synchronized_with_selected_task(): Promise<void> {
    const task = this.tasksView.explorer.selectedTask
    this.demoView.updateDemos(task ? this.database.getDemos(task) : null)
  }

  @reaction
  private options_synchronized_with_preferences_and_vcsConfiguration(): void {
    this.options.update(this.database.preferences, this.database.vcsConfiguration)
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

  @reaction
  private all_left_panels_in_same_state_as_active(): void {
    const leftPanelsExceptActive = [this.tasksView, this.solutionsView, this.demoView, this.optionsView]
      .filter(v => v !== this._activeView)
      .map(v => v.leftPanel)
    for (const leftPanel of leftPanelsExceptActive)
      this._activeView.leftPanel.isOpened ? leftPanel.open() : leftPanel.close()
  }
}
